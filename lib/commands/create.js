import { loadConfig } from '../config.js';
import { planterExists } from '../utils.js';
import degit from 'tiged';
import logger from '../logger.js';
import fs from 'fs-extra';
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
    .argument('<name>', 'planter to plant with')
    .argument('[dir]', 'directory to plant at')
    .action(async (name, dir, options) => {
      // Load user config (or default config)
      const error = (message) => cli.error(message);
      const config = loadConfig(error);
      await run({
        args: {
          name,
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
  const { name, dir } = args;
  const { planters } = config.Config;
  const planter = planters[name];

  if (planterExists(planter)) {
    //check if remote
    if (planter.type === 'remote') {
      doDegit(planter.location)
    } else if (planter.type === 'directory') {
      let directory = dir ? dir : `${path.basename(planter.location)}`;
      try {
        if (fs.pathExistsSync(planter.location)) {
          await fs.copy(planter.location, directory, { filter: excludeFiles });
          console.log(`copied ${planter.location} to ${directory}`)
        } else {
          let errorMessage = `Planter ${planter.print.name()} could not be used to create new project.`;
          errorMessage += ` Location path does not exist: ${planter.print.location()}`;
          error(errorMessage);
        }
        
      } catch (err) {
        console.error(err);
      }
    }
  
  } else {
    // pass value to degit assuming it's a remote repo/url
    doDegit(name)   
  }
}

function success(info) {
  console.log(`you're amazing`, info);
}

function error() {
  console.error(`you're bad`);
}

function excludeFiles(src) {
  // TODO: use the gitignore to exclude stuff
  let nodeModulesPath = path.join (planter.location, './node_modules');
  if (src.startsWith(nodeModulesPath)) {
    return false;
  }
  return true;
}

// TODO: rename
function doDegit(name) {
  try {
    const emitter = degit(name, {
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

    emitter.clone('path/to/dest').then(success);

  } catch (err) {
    console.error(err);
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