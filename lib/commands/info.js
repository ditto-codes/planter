import chalk from 'chalk';
import { loadConfig } from '../config.js';
import { updateUserConfig, planterExists } from '../utils.js';
import logger from '../logger.js';

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
      const error = (message) => cli.error(message);
      const config = loadConfig(error, true);
      run({
        args: { name },
        options,
      }, config, error );
    })
}

/**
 * Command logic
 * 
 * @param {Object} input user input (e.g., args, options)
 * @param {Object} config the config object, including its file path
 */
function run(input, config, error) {
  const { args } = input;
  const { name } = args;
  const { planters } = config.Config;
  const planter = planters[name];
  planterExists(planter, error, name);

  // Formatting helpers
  const dim = chalk.dim;
  const bold = chalk.bold;
  const alignChars = 18;
  let sep = `:`;
  let output = '';
  
  // Label keys should always match the Planter class
  const labels = {
    name: 'Name',
    location: 'Location',
    type: 'Type',
    position: 'Pinned',
    added: 'Date Added',
  }

  for (const [key, label] of Object.entries(labels)) {
    let value;
    const data = planter[key];

    switch (key)  {
      case 'name':
        value = planter.print.name();
        break;
      case 'location':
        value = planter.print.location();
        // if (planter.type === 'directory') value += dim(' (Directory)');
        break;
      case 'type': 
        let type = data[0].toUpperCase() + data.substring(1);
        value = type;
        break;
      case 'added':
        value = planter.print.added();
        break;
      case 'position':
        if (data === null) continue;
        value = planter.print.position();
        break;
      default: 
        value = data;
        break;
    }

    // TODO: change prefix color?
    let prefix = `${label}${sep}`.padEnd(alignChars);
    output += `${bold(prefix)}${value}\n`;
  }

  logger.info(output);
  updateUserConfig(config);
}