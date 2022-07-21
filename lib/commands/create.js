import { loadConfig } from '../config.js';

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
      const config = loadConfig();
      run({
        args: {
          name,
          path, 
        },
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
  const { name, path } = args;
  
  console.log(`  > Planting your project with '${name}'...`)
  console.log('  > beep... boop...')
  if (path) {
    console.log(`  > New project created at '${path}'`)
  } else {
    console.log(`  > New project created in current directory at './project-${name}'`)
  }
}