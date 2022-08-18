import chalk from 'chalk';
import { loadConfig } from '../config.js';
import logger from '../logger.js';
import { updateUserConfig } from '../utils.js';
import { planterExists } from '../utils.js';

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
      const error = (message) => cli.error(message);
      run({
        args: { name, position },
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
  const { name, position } = args;
  const { planters } = config.Config;
  const planter = planters[name];
  planterExists(planter, error, name);

  // Handle unpinning
  if (options.unpin) {
    planter.unpin();
    logger.info(`Unpinned ${planter.print.name()}.`);
    updateUserConfig(config);
    // Exit early since we're done
    return;
  }

  // Parse user input
  let newPos = parseInt(position);
  if (position === undefined || newPos === 0) {
    // Default to top of the list (position 1)
    newPos = 1; 
  }

  if (planter.position === newPos) {
    logger.info(`${planter.print.name()} is already at position ${planter.print.position()}.`);
    // Exit early since we didn't make any changes
    return;
  }

  if (isNaN(newPos)) {
    error(`Position must be a number but type was ${typeof position}.`, null, true);
  }
  
  // Save the current position
  let currentPos = planter.position;
  // Update the position
  planter.position = newPos;
  
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
      // Offset so position is not 0 indexed
      planter.position = i + 1;
    });

  if (position !== undefined && currentPos !== null) {
    logger.info(`${planter.print.name()} pinned to position ${planter.print.position()}.`);
  } else {
    logger.info(`${planter.print.name()} pinned to top.`);
  }
  
  updateUserConfig(config);
}