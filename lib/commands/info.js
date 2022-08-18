import { loadConfig } from '../config.js';
import { updateUserConfig } from '../utils.js';
import logger from '../logger.js';
import { planterExists } from '../utils.js';
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
      const error = (message) => cli.error(message);
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

  const labels = {
    location: 'Location',
    position: 'Pinned',
    created: 'Date Added',
  }

  const alignChars = 18;
  let str = `Planter:`.padEnd(alignChars) + `${planter.print.name()}\n`;

  let sep = `:`;
  // These keys should match the keys of the Planter class
  for (const [key, label] of Object.entries(labels)) {
    let value;

    // FIXME: Handle this error case
    const data = planter[key];

    switch (key)  {
      case 'location':
        value = planter.print.location();
        if (planter.type === 'directory') value += dim(' (Directory)');
        break;
      case 'created':
        value = planter.print.created();
        break;
      case 'position':
        if (data === null) continue;
        value = planter.print.position();
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