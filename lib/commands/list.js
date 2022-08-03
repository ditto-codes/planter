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
      run({
        args: {},
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
  const { options } = input;
  const { planters } = config.Config;

  // Sort by Creation Time (default)
  const list = Object.entries(planters).sort((a, b) => {
    return a[1].creationTime - b[1].creationTime;
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
  for (const [ key, planter ] of list) {
    let prefix = chalk.dim('-');
    let name = key;
    if (planter.position) {
      prefix = chalk.yellow('*');
      name = chalk.green(name);
    }

    logger.info(`  ${prefix} ${name}`);
  }
}