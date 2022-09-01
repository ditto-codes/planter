import { loadConfig } from '../config.js';
import { planterExists } from '../utils.js';
import Planter from '../planter.js';
import degit from 'tiged';
import logger from '../logger.js';
import fs from 'fs-extra';
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

  if (planterExists(planter)) {
    // If planter exists, use the planter's location
    if (planter.type === 'remote') {
      console.log('remote:true')
      clone(planter.location, error)
    } else if (planter.type === 'directory') {
      let directory = dir ? dir : `${path.basename(planter.location)}`;
      try {
        if (fs.pathExistsSync(planter.location)) {
          await fs.copy(planter.location, directory, { filter: (src) => excludeFiles(src, planter.location) });
          // TODO: run actual success message here
          console.log(`copied ${planter.location} to ${directory}`)
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
    console.log('planterExists:false')
    // If source is not the name of a planter,
    // assume source is itself a repo name or direct URL
    clone(source, error)   
  }
}

function success(info) {
  console.log(`success`, info);
}


/**
 * 
 * @param {*} source – a file to pattern match
 * @param {*} root – the location we're copying from
 * @returns {boolean} – whether or not to copy the file
 *  
 */

function excludeFiles(source, root) {
  // TODO: make patterns based on the actual .gitignore if there's one
  const patterns = ['*.js', 'path/**/*.txt'];
  const relativeSource = source.replace(root + '/', '');

  for (const pattern of patterns) {
    const isMatch = minimatch(relativeSource, pattern, { matchBase: true })
    // if it matches, we need to exclude it (return false)
    if (isMatch === true) return false;
  }

  // If no patterns were matched, we can keep it
  return true;
}

function clone(source, error) {
  try {
    const emitter = degit(source, {
      cache: false,
      force: true,
      verbose: true,
    });

    emitter.on('info', (info) => {
      logger.info(info.code, info.message, '\n');
      if (info.repo) {
        logger.info(info.repo);
      }
    });

    emitter.clone(source).then(success);

  } catch (err) {
    console.error(err);
    error(`Could not create new project. There may be a problem with the location: ${Planter.print.location(source)}`);
  }
}

/* 
planter create svelte ./cool-svelte-project

  1. Check if its an existing planter
    - if yes
      - and a remote location, pass it to degit
      - and is a local location, use git API?
    - if no
      - just pass the value assuming its a remote repo/URL that degit can parse
  2. Use degit to do the stuff
  
  3(?). Report info about what happened
    - errors
    - success message
*/
