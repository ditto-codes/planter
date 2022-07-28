import { loadConfig } from '../config.js';
import { updateUserConfig } from '../utils.js';
import logger from '../logger.js';

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
    .option('-n, --name <new-name>', 'Edit the name of a planter')
    .option('-l, --location <location>', 'Edit the location of a planter')
    .option('-d, --delete', 'Remove a planter from your list')
    .option('-f, --force', 'Edit something... dangerously. (Force the edit without any prompts.)')
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
  const [ userConfig ] = config;
  const { planters } = userConfig;

  if (!planters[name]) {
    // TODO: handle planter doesn't exist
    return;
  }

  // TODO: log stuff for all of these

  if (options.delete) {
    delete planters[name];
    logger.info(`deleting ${name}`)
    return;
  }

  if (options.name) {
    planters[options.name] = { ...planters[name] };
    logger.info(`updating name ${name} to ${options.name}`)
    delete planters[name];
  }

  if (options.location) {
    logger.info(`updating ${name }loc ${location} to ${options.location}`)
    planters[name].location = options.location;
  }

  updateUserConfig(config);
}