import { loadConfig } from '../config.js';
import { planterExists } from '../utils.js';

/**
 * Command initializer
 * 
 * @param {Command} cli the cli program 
 */
export default function cmd(cli) {
  cli
    .command('create', { isDefault: true })
    .description('Create a new project using a planter.')
    .argument('<name>', 'planter to plant with')
    .argument('[path]', 'path to plant at')
    .action((name, path, options) => {
      // Load user config (or default config)
      const error = (message) => cli.error(message);
      const config = loadConfig(error);
      run({
        args: {
          name,
          path, 
        },
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
  const { name, path } = args;
  
  console.log(`  > Planting your project with '${name}'...`)
  console.log('  > beep... boop...')
  if (path) {
    console.log(`  > New project added at '${path}'`)
  } else {
    console.log(`  > New project added in current directory at './project-${name}'`)
  }
}