import { loadConfig } from '../config.js';
import { updateUserConfig } from '../utils.js';
import logger from '../logger.js';
import chalk from 'chalk';

/**
 * Command initializer
 * 
 * @param {Command} cli the cli program 
 */
export default function cmd(cli) {
  cli
    .command('info')
    .description('Prints all info about a planter in your list')
    .argument('<name>', 'Name of the planter to show info for')
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
 * @param {Object} config the config object, including its file path
 */
function run(input, config) {
  const { args } = input;
  const { name } = args;
  const { planters } = config.Config;
  const planter = planters[name];
  
  // TODO: present this info nicely

  // Formatting helpers
  const f_name = chalk.green.bold(name);
  const f_pos = chalk.yellow;
  const f_loc = chalk.cyan;
  const dim = chalk.dim;

  const labels = {
    location: 'Location',
    position: 'Pinned',
    creationTime: 'Date Added',
  }

  const alignChars = 18;
  let str = `Planter:`.padEnd(alignChars) + `${f_name}\n`;

  let sep = `:`;
  for (const [key, label] of Object.entries(labels)) {
    let value;

    const data = planter[key];

    switch (key)  {
      case 'location':
        value = f_loc(data);
        if (planter.isDirectory) value += dim(' (Directory)');
        break;
      case 'creationTime':
        value = new Date(data * 1000).toLocaleString();
        break;
      case 'position':
        if (data === null) continue;
        value = chalk.yellow(data);
        break;
      default: 
        value = data;
        break;
    }

    let prefix = `${label}${sep}`.padEnd(alignChars);
    str += `${prefix}${value}\n`;
  }

  logger.info(str);

  updateUserConfig(config);
}