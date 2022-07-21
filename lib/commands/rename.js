import { loadConfig } from '../config.js';

/**
 * Command initializer
 * 
 * @param {Command} cli the cli program 
 * @param {Object} config the user config
 */
export default function cmd(cli) {
  // Load user config (or create new user config)
  const config = loadConfig(true);
  
  cli
    .command('rename')
    .description('Renames a planter in your list')
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
  const { args, options } = input;
  
}