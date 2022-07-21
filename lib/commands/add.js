import { loadConfig } from '../config.js';
import fs from 'fs-extra';

/**
 * Command initializer
 * 
 * @param {Command} cli the cli program 
 */
export default function cmd(cli) {
  cli
    .command('add')
    .description('Add a planter to your list')
    .argument('<name>', 'name of the planter to use as a reference')
    .argument('<location>', 'the repo URL or name')
    .option('-d, --dir', 'Treat the location as a local directory instead of remote repo', false)
    .action((name, location, options) => {
      // Load user config (or create new user config)
      const config = loadConfig(true);
      run({
        args: { name, location },
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
  const { name, location } = args;
  const [userConfig, configPath] = config;
  const { planters } = userConfig;
  const creationTime = Math.floor(new Date().getTime() / 1000);

  const newPlanter = {
    location,
    isDirectory: options.dir,
    creationTime,
  }

  // console.log(planters);

  if (!planters[name]) {
    planters[name] = newPlanter;
    userConfig.planters = { ...planters };

    console.log('adding planter to config', configPath);
    fs.outputJsonSync(configPath, userConfig, { spaces: 2 });
    console.log(`planter '${name}' added`);
  } else {
    console.log(`planter '${name}' already exists`);
  }

}