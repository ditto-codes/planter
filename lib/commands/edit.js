import { loadConfig } from '../config.js';

/**
 * Command initializer
 * 
 * @param {Command} cli the cli program 
 */
export default function cmd(cli) {
  cli
    .command('edit')
    .description('Edit a planter in your list')
    .argument('<name>', 'Name of the planter to edit')
    .options('-n, --name <new-name>', 'Edit the name of a planter')
    .options('-l, --location <location>', 'Edit the location of a planter')
    .options('-d, --delete', 'Remove a planter from your list')
    .options('-f, --force', 'Edit something... dangerously. (Force the edit without any prompts.)')
    .action((name, options) => {
      // Load user config (or create new user config)
      const config = loadConfig(true);
      run({
        args: { name },
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
  const { name } = args;
  const [ userConfig, configPath ] = config;

  if (!userConfig.planters[name]) {
    // TODO: handle planer doesn't exist
    // Exit here, or invert if
  }

  const planter = userConfig.planters[name];

}