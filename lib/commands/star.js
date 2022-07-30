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
    .argument('[rank]', 'Specific rank to set the planter at. (1 being the top of the list.)')
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

  if (options.unstar) {
    planters[name].rank = null;
    logger.info(`Planter ${f(name)} unstarred.`);
    updateUserConfig(config);
    // Exit early
    return;
  }

  // Parse user input
  let newRank = parseInt(rank);
  if (rank === undefined || newRank === 0) {
    console.log('using default', rank);
    // Default to top of the list (rank 1)
    newRank = 1; 
  }
  if (isNaN(newRank)) {
    logger.warn(`Rank must be a number but was ${typeof rank}`);
    // Exit early
    return;
  }
  
  // Save the current rank for comparison below
  let currentRank = planters[name].rank;
  // Update the rank
  planters[name].rank = newRank;
  
  // Shift all ranks based on the newly set rank
  // 
  // 1. Filter out unranked planters
  // 2. Sort list of ranked planters
  // 3. Replace the rank values based on the sorted order (index)
  // 4. Note: we offset the index + 1 to make rank readable as an ordinal indicator
  //    However, a user input rank of 0 (or less) still corresponds to 1st.
  // 
  // Note: [ planterName, planterObject ] = entry, 
  // hence the use of destructuring below
  Object.entries(planters)
    // 1
    .filter(([ , planter ]) => (planter.rank))
    // 2
    .sort((a, b) => {
      const [ planterNameA, planterA ] = a;
      const [ , planterB ] = b;
      // The planter being ranked should have precedence if its new rank
      // is the same as an existing planter's rank
      if (planterNameA === name && (planterA.rank === planterB.rank)) {
        // Don't give it precedence if it's being deranked
        if (newRank > currentRank) return 1;
        else return -1;
      } else {
        return planterA.rank - planterB.rank;
      }
    })
    // 3
    .forEach(([ , planter ], i) => {
      // Offset
      planter.rank = i + 1;
    });
  
  updateUserConfig(config);
}