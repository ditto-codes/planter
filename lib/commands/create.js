import { loadConfig } from '../config.js';
import { planterExists } from '../utils.js';
import Planter from '../planter.js';
import degit from 'tiged';
import logger from '../logger.js';
import fs from 'fs-extra';
import { promises as fsp } from "fs";
import minimatch from 'minimatch';
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
    .argument('<source>', 'planter to plant with')
    .argument('[dir]', 'directory to plant at')
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

  // TODO: if dir = undefined, set it to .
  // const output = dir ? dir : '.';

  if (planterExists(planter)) {
    let directory = dir ? dir : `${path.basename(planter.location)}`;
    // If planter exists, use the planter's location
    if (planter.type === 'remote') {

      clone(planter.location, directory, error);
      success({ planter, directory });
    } else if (planter.type === 'directory') {
      try {
        if (fs.pathExistsSync(planter.location)) {
          await copy(planter.location, directory);
          success({ planter, directory });
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
    clone(source, directory, error);
    success({ source, directory }); 
  }
}

function success({ planter = null, source = '', directory = ''}) {
  if (planter) {
    logger.info(`Planted ${planter.print.name()} at ${Planter.print.location(directory)}`)
  } else {
    logger.info(`Used ${Planter.print.location(source)} to create new project at ${Planter.print.location(directory)}`)
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
  
  console.log(gitignore, planterignore);
  console.log(ignoreFile);
  if (ignoreFile) {
    const data = await fsp.readFile(ignoreFile, 'utf8');
    ignore = [
      ...ignore, 
      ...data.split(/\r?\n/g).filter(pattern => pattern != '')
    ];
  }

  console.log('ignore', ignore);
  return ignore;
}

async function copy(source, directory, options = { ignore: []}) {
  try {
    // Get list of files to ignore
    const ignore = await getIgnore(
      source, 
      Array.isArray(options.ignore) ? options.ignore : [options.ignore]
    );
    // Copy files (excluding those to ignore)
    console.log('ayo', source, directory);
    await fs.copy(source, directory, { 
      filter: (file) => keepFile(file, source, ignore)
    });
  } catch (err) {
    throw err;
  }
}

// Maybe add an extra check before runnin clone on a non-planter, to make sure
// they want to try to create using an unlisted remote repo? this oculd help catch typos
// that result in degit error, before seeing the last "Could not create" error here.
function clone(source, output, error) {
  try {
    const emitter = degit(source, {
      cache: false,
      // TODO: change to false, unless maybe user includes -f flag
      force: true,
      verbose: false,
    });

    emitter.on('info', (info) => {
      logger.info(info.code, info.message, '\n');
      if (info.repo) {
        logger.info(info.repo);
      }
    });

    emitter.clone(output);

  } catch (err) {
    console.error(err);
    error(`Could not create new project. There may be a problem with the location: ${Planter.print.location(source)}`);
  }
}
