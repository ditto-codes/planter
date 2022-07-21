import { loadConfig } from '../config.js';

/**
 * Command initializer
 * 
 * @param {Command} cli the cli program 
 */
export default function cmd(cli) {
  cli
    .command('star')
    .description('Pins a planter to the top of your list')
    .option('-d --delete', 'Unstars a planter')
    .option('-r --rank', 'Define the rank of a starred planter')
    .action((options) => {
      // Load user config (or create new user config)
      const config = loadConfig(true);
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
  const { args, options } = input;
  
}