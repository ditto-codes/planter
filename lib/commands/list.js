import { loadConfig } from '../config.js';

/**
 * Command initializer
 * 
 * @param {Command} cli the cli program 
 * @param {Object} config the user config
 */
export default function cmd(cli) {
  // Load user config (or default config)
  const config = loadConfig();

  cli
    .command('list')
    .description('List available planters')
    .option('-a --alphanumeric', 'Sorts list of planters alphanumerically', false)
    .action((options) => {
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
 * @param {Object} config the user config
 */
function run(input, config) {
  const { options } = input;
  const { planters } = config;

  // Sort by Creation Time (default)
  const list = Object.entries(planters).sort((a, b) => {
    return a[1].unixCreationTime - b[1].unixCreationTime;
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
  for (const [ name ] of list) {
    console.log(`  - ${name}`);
  }
}