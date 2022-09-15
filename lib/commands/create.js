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

/**
 * Command initializer
 * 
 * @param {Command} cli the cli program 
 */
export default function cmd(cli) {
  cli
    .command('create', { isDefault: true })
    .description('Create a new project using a planter.')
    .argument('<source>', 'Planter to plant with')
    .argument('[dir]', 'Directory to plant at')
    .option('-f, --force', 'Force the created directory to overwrite an existing one.', false)
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
  const { source, dir } = args;
  const { planters } = config.Config;
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

// TODO: add docs
async function getIgnore(directory, patterns = []) {
  let gitignore = path.join(directory, '.gitignore');
  let planterignore = path.join(directory, '.planterignore');
  let ignore = [...patterns];
  let ignoreFile = null;

  if (fs.pathExistsSync(gitignore)) {
    ignoreFile = gitignore;
  } else if (fs.pathExistsSync(planterignore)) {
    ignoreFile = planterignore;
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

// TODO: add docs
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

// TODO: add docs
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
    } else {
      message += `There may be a problem with the location: ${Planter.print.location(source)}`;
      console.error(err);
    }
    error(message);
  }
}

// TODO: add docs
function success({ planter = null, source = '', directory = '', info = null, isLocal = false }) {
  if (planter) {
    if (isLocal) logger.info(chalk.bold.green(`🪴  Planted!`));  
    logger.info(`Used ${planter.print.name()} at ${Planter.print.location(directory)}`);
  } else {
    logger.whisper(`Used ${info.repo.url}`);
    logger.info(`Used ${Planter.print.location(source)} at ${Planter.print.location(directory)}`);
  }
}

// TODO: add docs
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