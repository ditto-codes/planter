import path from 'path';
import fs from 'fs-extra';
import { loadConfig } from '../config.js';
import Planter from '../planter.js';
import { updateUserConfig, planterExists } from '../utils.js';
import logger from '../logger.js';
import { run as info } from './info.js';

/**
 * Command initializer
 * 
 * @param {Command} cli the cli program 
 */
export default function cmd(cli) {
  cli
    .command('add')
    .description('Add a planter to your list')
    .argument('<name>', 'name of the planter to use as a reference')
    .argument('<location>', 'the repo URL or name')
    .option('-l, --local', 'Treat the location as a local repo instead of a remote repo', false)
    .action((name, location, options) => {
      // Load user config (or create new user config)
      const error = (message) => cli.error(message);
      const config = loadConfig(error, true);
      run({
        args: { name, location },
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
function run(input, config, error) {
  const { args, options } = input;
  const { name, location } = args;
  const { planters } = config.Config;

  let _type;
  let _location = location;

  if (options.local) {
    _type = 'local';
  } else {
    _type = 'remote';
  }

  if (_type === 'local') {
    _location = path.resolve(location);
    if (!fs.pathExistsSync(_location)) {
      error(`Location does not exist: ${Planter.print.location(_location)}`);
    }
  }

  const planter = new Planter(name, {
    location: _location,
    type: _type,
  });

  if (!planterExists(planters[name])) {  
    planters[name] = planter;
    updateUserConfig(config);
    logger.info(`Planter ${planter.print.name()} added.`);
    info({ args: { name } }, config, error);
  } else {
    logger.warn(`Planter ${planter.print.name()} already exists! Choose another name.`);
  }
}