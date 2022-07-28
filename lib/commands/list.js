import { loadConfig } from '../config.js';
import chalk from 'chalk';

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
 * @param {Array} config the user config, path to loaded config
 */
function run(input, config) {
  const { options } = input;
  const { planters } = config[0];

  // Sort by Creation Time (default)
  // a: [0: key, 1: value]
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
    // Sort by rank (default)
    list.sort((a, b) => {
      let rankA = a[1].rank;
      let rankB = b[1].rank;
      // Handle falsey ranks (e.g., no rank)
      if (!rankA || rankA === NaN) rankA = Infinity;
      if (!rankB || rankB === NaN) rankB = Infinity;
      // Least to greatest (rank 1 at the top of the list)
      return rankA - rankB;
    });
  }
  
  // Print the list
  for (const [ key, planter ] of list) {
    let prefix = chalk.dim('-');
    let name = key;
    if (planter.rank) {
      prefix = chalk.yellow('*');
      name = chalk.green(name);
    }

    console.log(`  ${prefix} ${name}`);
  }
}