import { loadConfig } from '../config.js';
import { updateUserConfig } from '../utils.js';

/**
 * Command initializer
 * 
 * @param {Command} cli the cli program 
 */
export default function cmd(cli) {
  cli
    .command('star')
    .description('Pins a planter to the top of your list')
    .argument('<name>', 'Name of the planter to star')
    .argument('[rank]', 'Specific rank to set the planter at. (1 being the top of the list.)', 1)
    .action((name, rank, options) => {
      // Load user config (or create new user config)
      const config = loadConfig(true);
      run({
        args: { name, rank },
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
  const { name, rank } = args;
  const { planters } = config.Config;

  // Update the rank
  // Rank is 1 unless the user sets it
  planters[name].rank = rank;

  // TODO: shift all other pinned

  updateUserConfig(config);
}