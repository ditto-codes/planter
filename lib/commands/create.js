import { loadConfig } from '../config.js';
import { planterExists } from '../utils.js';
import Planter from '../planter.js';
import logger from '../logger.js';
import degit from 'tiged';
import fs from 'fs-extra';
import { promises as fsp } from "fs";
import minimatch from 'minimatch';
import chalk from 'chalk';
import path from 'path';
import inquirer from 'inquirer';
import autocompletePrompt from 'inquirer-autocomplete-prompt';
import fuzzy from 'fuzzy';

/**
 * Command initializer
 * 
 * @param {Command} cli the cli program 
 */
export default function cmd(cli) {
  return cli
    .command('create', { isDefault: true })
    .description('Create a new project using a planter or public repo')
    .argument('[source]', 'The name of a planter or a public repo')
    .argument('[dir]', 'Directory of the new project') 
    .option('-f, --force', 'Force the created directory to overwrite an existing one', false)
    .action(async (source, dir, options) => {
      // Load user config (or default config)
      const error = (message) => cli.error(message);
      const config = loadConfig(error);
      await run({
        args: {
          source,
          dir, 
        },
        options,
      }, config, error);
    })
}

/**
 * Command logic
 * 
 * @param {Object} input user input (e.g., args, options)
 * @param {Object} config the config object, including its file path
 */
 async function run(input, config, error) {
  const { args, options } = input;
  const { planters } = config.Config;

  // Optional arguments
  let source = args.source ? args.source : false;
  let dir = args.dir ? args.dir : false;

  // List of planter names
  const list = Object.keys(planters);

  // Questions for inquirer prompts
  const questions = {
    source: {
      type: 'autocomplete',
      name: 'selectSource',
      message: 'Select a Planter to use',
      pageSize: 10,
      loop: false,
      source: (answers, input) => search(answers, input, list),
    },
    dir: {
      type: 'input',
      name: 'selectDir',
      message: 'Where do you want to start your project?',
      suffix: chalk.dim('\n(Leave blank to use repo name.)'),
    }
  }

  // Register autocomplete prompt type (via plugin)
  inquirer.registerPrompt('autocomplete', autocompletePrompt);
  
  // If no source (user input: 'planter')
  if (!source) {
    // Check if planters is empty
    if (list.length === 0) {
      logger.info(`🌱 ${chalk.yellow('No planters added.')} Try ${chalk.green('planter add --help')}`);
      return;
    }
    // Prompt for both source and dir
    inquirer
      .prompt([questions.source, questions.dir])
      .then((answers) => {
        source = answers.selectSource;
        if (!dir) {
          dir = answers.selectDir;
        }
        plant(planters, source, dir, options, error);
      });
  // If source, but no dir (user input: 'planter source')
  } else if (!dir) {
    // Just prompt for dir
    inquirer
      .prompt([questions.dir])
      .then((answers) => {
        dir = answers.selectDir;
        plant(planters, source, dir, options, error);
      });
  // Else run assuming user input all options (user input: 'planter source dir')
  } else {
    plant(planters, source, dir, options, error);
  }
}

/**
 * Main command logic for creating a project ("planting")
 * 
 * @param {object} planters all planters and their info
 * @param {string} source the planter to use
 * @param {string} dir the dir to plant in
 * @param {object} options command options
 * @param {function} error command error
 */
async function plant(planters, source, dir, options, error) {
  const planter = planters[source];

  if (planterExists(planter)) {
    let directory = dir ? dir : `${path.basename(planter.location)}`;
    // If planter exists, use the planter's location
    if (planter.type === 'remote') {
      clone(planter.location, directory, error, options, planter);
      
    } else if (planter.type === 'local') {
      try {
        if (fs.pathExistsSync(planter.location)) {
          await copy(planter.location, directory);
          success({ planter, directory, isLocal: true });
        } else {
          let errorMessage = `${planter.print.name()} could not be used to create new project.`;
          errorMessage += ` Location path does not exist: ${planter.print.location()}`;
          error(errorMessage);
        }
        
      } catch (err) {
        console.error(err);
        error(`${planter.print.name()} could not be used to create new project.`);
      }
    }
  
  } else {
    let directory = dir ? dir : `${path.basename(source)}`;
    // If source is not the name of a planter,
    // assume source is itself a repo name or direct URL
    clone(source, directory, error, options);
  }
}

/**
 * Indicates whether a file should be kept in a list.
 * A file should be excluded if it matches certain patterns.
 * (For use as a filter callback.)
 * 
 * @param {string} filePath a file path 
 * @param {string} directory the directory the files are in
 * @returns {boolean} whether or not to keep the file
 *  
 */

function keepFile(filePath, directory, patterns) {
  const relativeSource = filePath.replace(directory + '/', '');
  for (const pattern of patterns) {
    const isMatch = minimatch(relativeSource, pattern, { matchBase: true })
    // If it matches, we need to exclude it
    if (isMatch === true) return false;
  }

  // If no patterns were matched, we can keep it
  return true;
}

/**
 * Gets list of file patterns to ignore by reading ignore files
 * 
 * @param {string} directory path to search for ignore files at
 * @param {array} patterns list of default patterns to ignore
 * @returns patterns to ignore
 */
async function getIgnore(directory, patterns = []) {
  let gitignore = path.join(directory, '.gitignore');
  let planterignore = path.join(directory, '.planterignore');
  let ignore = [...patterns];
  let ignoreFile = null;

  if (fs.pathExistsSync(planterignore)) {
    ignoreFile = planterignore;
  } else if (fs.pathExistsSync(gitignore)) {
    ignoreFile = gitignore;
  }
  
  if (ignoreFile) {
    const data = await fsp.readFile(ignoreFile, 'utf8');
    ignore = [
      ...ignore, 
      ...data.split(/\r?\n/g).filter(pattern => pattern != '')
    ];
  }
  
  return ignore;
}

/**
 * Copies files from a directory. Excludes files based on
 * ignore files (e.g., .gitignore) in the source directory.
 * 
 * @param {string} source path to copy from
 * @param {string} directory path to copy to
 */
async function copy(source, directory) {
  try {
    // Get list of files to ignore
    const ignore = await getIgnore(source, ['.git']);
    // Copy files (excluding those to ignore)
    await fs.copy(source, directory, { 
      filter: (file) => keepFile(file, source, ignore)
    });
  } catch (err) {
    throw err;
  }
}

/**
 * Clones files from a public repo using degit.
 * 
 * @param {string} source repo location to clone from
 * @param {string} output path to clone to
 * @param {function} error triggers cli error
 * @param {object} options the cli options 
 * @param {object} planter the planter object
 */
async function clone(source, output, error, options, planter) {
  try {
    const loadInterval = loading();
    const emitter = degit(source, {
      cache: false,
      force: options.force,
      verbose: false,
    });
    emitter.on('info', (info) => {
      if (info.code === 'SUCCESS') {
        process.stdout.clearLine();
        process.stdout.write('\r');
        process.stdout.write(chalk.bold.green(`🪴  Planted!`));
        process.stdout.write('\n');
        success({ planter, source, directory: output, info });
        clearInterval(loadInterval);
      }
    });

    await emitter.clone(output);

  } catch (err) {
    process.stdout.moveCursor(0, -1);
    let message = '\n';
    if (err.code === 'COULD_NOT_DOWNLOAD') {
      message += `Could not download: ${err.url}\n`;
      logger.warn(`\nNote: Planter only supports public remote repos.`);
    } else if (err.code === 'DEST_NOT_EMPTY') {
      message += `Destination ${Planter.print.location(output)} is not empty. Use --force option to replace the directory.`
    } else if (err.code === 'BAD_SRC') {
      message += `${Planter.print.location(source)} is not added to your library and is not a valid public repo name or URL.`;
      
    } else {
      message += `There may be a problem with the location: ${Planter.print.location(source)}`;
      console.error(err);
    }
    error(message);
  }
}

/**
 * @typedef {object} SuccessOptions options to build success message  
 * @param {object} planter the planter object
 * @param {string} source the source location
 * @param {string} directory the output directory
 * @param {object} info info object from degit
 * @param {boolean} isLocal is the planter location local
 */ 
/**
 * @param {SuccessOptions}
 */
function success({ planter = null, source = '', directory = '', info = null, isLocal = false }) {
  if (planter) {
    if (isLocal) logger.info(chalk.bold.green(`🪴  Planted!`));  
    logger.info(`Used ${planter.print.name()} at ${Planter.print.location(directory)}`);
  } else {
    logger.whisper(`Used ${info.repo.url}`);
    logger.info(`Used ${Planter.print.location(source)} at ${Planter.print.location(directory)}`);
  }
}

/**
 * Prints loading message on an interval
 * 
 * @returns the interval ID
 */
function loading() {
  let count = 1;
  return setInterval(() => {
    let message = 'Planting';
    for (let i = 0; i < count; i++) {
      message += '.';
    }
    process.stdout.clearLine();
    process.stdout.write('\r');
    process.stdout.write(chalk.green(message));
    if (count === 10) {
      count = 0;
    } else {
      count++;
    }
  }, 100);
}

/**
 * Fuzzy search
 * 
 * @param {object} answers the answers object passed from inquirer
 * @param {string} input user input to use for search
 * @param {array} list options to filter in a search
 * @returns 
 */
function search(answers, input = '', list) {
  return new Promise((resolve) => {
    // console.log('hey');
    resolve(fuzzy.filter(input, list).map((el) => el.original));
  })
}