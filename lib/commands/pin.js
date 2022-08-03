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
    .command('pin')
    .description('Pins a planter to the top of your list')
    .argument('<name>', 'Name of the planter to star')
    .argument('[position]', 'Specific position to set the planter at. (1 being the top of the list.)')
    .option('-u, --unpin', 'Removes position from the planter')
    .action((name, position, options) => {
      // Load user config (or create new user config)
      const config = loadConfig(true);
      run({
        args: { name, position },
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
  const { name, position } = args;
  const { planters } = config.Config;

  // Formatting helpers
  const f = chalk.green.bold;
  const f_pos = chalk.yellow;

  // Handle unpinning
  if (options.unpin) {
    planters[name].position = null;
    logger.info(`Unpinned ${f(name)}.`);
    updateUserConfig(config);
    // Exit early
    return;
  }

  // Parse user input
  let newPos = parseInt(position);
  if (position === undefined || newPos === 0) {
    // Default to top of the list (position 1)
    newPos = 1; 
  }
  if (isNaN(newPos)) {
    // Exit early
    // cli.error(`Position must be a number but was ${typeof position}.`);
    logger.error(`Position must be a number but type was ${typeof position}.`, null, true);
  }
  
  // Save the current position
  let currentPos = planters[name].position;
  let sortedPos;
  // Update the position
  planters[name].position = newPos;
  
  // Shift all pinned planters based on the newly set position
  // 
  // 1. Filter out unpinned planters
  // 2. Sort list of pinned planters
  // 3. Replace the position values based on the sorted order (index)
  // 4. Note: we offset the index + 1 to make position readable as an ordinal indicator
  //    However, a user input position of 0 (or less) still corresponds to 1st.
  // 
  // Note: [ planterName, planterObject ] = entry, 
  // hence the use of destructuring below
  Object.entries(planters)
    // 1
    .filter(([ , planter ]) => (planter.position))
    // 2
    .sort((a, b) => {
      const [ planterNameA, planterA ] = a;
      const [ , planterB ] = b;
      // The planter being pinned should have precedence if its new position
      // is the same as an existing planter's position
      if (planterNameA === name && (planterA.position === planterB.position)) {
        // Don't give it precedence if it's being moved down the list
        if (newPos > currentPos && currentPos !== null) return 1;
        else return -1;
      } else {
        return planterA.position - planterB.position;
      }
    })
    // 3
    .forEach(([ key , planter ], i) => {
      // Offset
      planter.position = i + 1;
      // Save the value of the actual position, (after sorting)
      if (key === name) sortedPos = planter.position;
    });

  if (position !== undefined && currentPos !== null) {
    logger.info(`${f(name)} pinned to position ${f_pos(sortedPos)}.`);
  } else {
    logger.info(`${f(name)} pinned to top.`);
  }
  
  updateUserConfig(config);
}