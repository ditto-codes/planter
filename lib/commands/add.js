import path from 'path';
import { loadConfig } from '../config.js';
import Planter from '../planter.js';
import { updateUserConfig } from '../utils.js';
import { planterExists } from '../utils.js';
import logger from '../logger.js';

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
    .option('-d, --dir', 'Treat the location as a local directory instead of remote repo', false)
    .option('-t, --type <type>', `Identify the type of the planters location. Valid types: 'remote', 'directory'`)
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

  // if (options.type === 'directory')

  let _type;
  let _location = location;

  if (options.type) {
    _type = options.type;
  } else if (options.dir) {
    _type = 'directory';
  } else {
    _type = 'remote';
  }

  if (_type === 'directory') {
    // TODO: check if path exists
    _location = path.resolve(location);

  }

  const planter = new Planter(name, {
    location: _location,
    type: _type,
  });

  if (!planterExists(planters[name])) {  
    planters[name] = planter;
    updateUserConfig(config);
    logger.info(`Planter ${planter.print.name()} added.`);
  } else {
    logger.warn(`Planter ${planter.print.name()} already exists! Choose another name.`);
  }
}