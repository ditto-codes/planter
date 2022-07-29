import chalk from 'chalk';
import { loadConfig } from '../config.js';
import logger from '../logger.js';
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
    .option('-u, --unstar', 'Removes rank from the planter')
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
  const { args, options } = input;
  const { name, rank } = args;
  const { planters } = config.Config;

  const f = chalk.green.bold;

  // TODO: if can't parse as int 
  const _rank = parseInt(rank);
  if (_rank === NaN) {
    logger.warn(`Rank must be a number but was ${typeof rank}`);
  }

  if (options.unstar) {
    planters[name].rank = null;
    logger.info(`Planter ${f(name)} unstarred.`);
    updateUserConfig(config);
    // Exit early
    return;
  }

  // Update the rank
  // Rank is 1 unless the user sets it
  planters[name].rank = _rank;

  for (const [planterName, planter] of Object.entries(planters)) {
    if (planter.rank !== null && planterName !== name) {
      planter.rank += 1;
    }
  }

  updateUserConfig(config);
}