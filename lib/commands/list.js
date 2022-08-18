import chalk from 'chalk';
import { loadConfig } from '../config.js';
import logger from '../logger.js';

/**
 * Command initializer
 * 
 * @param {Command} cli the cli program 
 */
export default function cmd(cli) {
  cli
    .command('list')
    .description('List available planters')
    .option('-a --alphanumeric', 'Sorts list of planters alphanumerically', false)
    .action((options) => {
      // Load user config (or default config)
      const config = loadConfig();
      const error = (message) => cli.error(message);
      run({
        args: {},
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
function run(input, config) {
  const { options } = input;
  const { planters } = config.Config;

  // Sort by Creation Time (default)
  const list = Object.entries(planters).sort((a, b) => {
    return a[1].unixTimestamp - b[1].unixTimestamp;
  });

  // Additional sorts
  if (options.alphanumeric === true) {
    // Sort Alphanumerically (optional)
    list.sort((a, b) => {
      return a[0].localeCompare(b[0]);
    });

  } else {
    // Sort by position (default)
    list.sort((a, b) => {
      let posA = a[1].position;
      let posB = b[1].position;
      // Handle falsey poss (e.g., no pos)
      if (!posA || posA === NaN) posA = Infinity;
      if (!posB || posB === NaN) posB = Infinity;
      // Least to greatest (pos 1 at the top of the list)
      return posA - posB;
    });
  }
  
  // Print the list
  for (const [ , planter ] of list) {
    logger.info(planter.print.listItem());
  }
}