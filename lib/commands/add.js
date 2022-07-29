import { loadConfig } from '../config.js';
import { updateUserConfig } from '../utils.js';
import logger from '../logger.js';
import chalk from 'chalk';

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
    .action((name, location, options) => {
      // Load user config (or create new user config)
      const config = loadConfig(true);
      run({
        args: { name, location },
        options,
      }, config);
    })
}

/**
 * Command logic
 * 
 * @param {Object} input user input (e.g., args, options)
 * @param {Object} the config object, including its file path
 */
function run(input, config) {
  const { args, options } = input;
  const { name, location } = args;
  const { planters } = config.Config;
  const creationTime = Math.floor(new Date().getTime() / 1000);

  const newPlanter = {
    location,
    isDirectory: options.dir,
    creationTime,
  }

  if (!planters[name]) {
    planters[name] = newPlanter;
    updateUserConfig(config);
    logger.info(`Planter ${chalk.green.bold(name)} added.`);
  } else {
    logger.warn(`Planter ${chalk.green.bold(name)} already exists! Choose another name.`);
  }
}