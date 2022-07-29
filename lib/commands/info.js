import { loadConfig } from '../config.js';
import { updateUserConfig } from '../utils.js';
import logger from '../logger.js';

/**
 * Command initializer
 * 
 * @param {Command} cli the cli program 
 */
export default function cmd(cli) {
  cli
    .command('star')
    .description('Prints all info about a planter in your list')
    .argument('<name>', 'Name of the planter to show info for')
    .action((name, options) => {
      // Load user config (or create new user config)
      const config = loadConfig(true);
      run({
        args: { name },
        options,
      }, config);
    })
}

/**
 * Command logic
 * 
 * @param {Object} input user input (e.g., args, options)
 * @param {Object} config the config object, including its file path
 */
function run(input, config) {
  const { args } = input;
  const { name } = args;
  const { planters } = config.Config;

  // TODO: present this info nicely
  logger.info(planters[name]);

  updateUserConfig(config);
}