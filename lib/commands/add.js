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
    .command('add')
    .description('Add a planter to your list')
    .argument('<location>', 'the URL or name of a repo')
    .option('-d, --dir', 'Adds a planter from a local directory', false)
    .action((location, options) => {
      run({
        args: { location },
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
  const { location } = args;
  const { planters } = config;

  if (options.dir) {

  }
  
  console.log('location', location);

}