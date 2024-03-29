import inquirer from 'inquirer';
import chalk from 'chalk';
import { loadConfig } from '../config.js';
import { updateUserConfig } from '../utils.js';
import logger from '../logger.js';
import { planterExists } from '../utils.js';
import Planter from '../planter.js';

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
    .option('-f, --force', 'Edit something... dangerously. (Force the edit without any prompts.)', false)
    .option('-R, --remote', `Set the location type to remote`)
    .option('-L, --local', `Set the location type to local`)
    .action((name, options) => {
      // Load user config (or create new user config)
      const error = (message) => cli.error(message);
      const config = loadConfig(error, true);
      run({
        args: { name },
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
  const { name } = args;
  const { planters } = config.Config;
  const planter = planters[name];
  planterExists(planter, error, name);

  const deleteData = () => {
    delete planters[name];
  }

  const writeData = () => {
    updateUserConfig(config);
  }

  if (options.delete) {
    const logDelete = () => {
      logger.info(`Removed ${Planter.print.name(name)} from your list.`);
    }
    if (!options.force) {
      let question = {
        name: 'confirmDelete',
        type: 'confirm',
        prefix: '',
        message: chalk.yellow(`Planter ${planter.print.name()} ${`will be removed from your list. Are you sure?`}`),
      }
      inquirer.prompt([question]).then((answers) => {
        if (answers['confirmDelete']) {
          deleteData();
          writeData();
          logDelete();
        } else {
          logger.info(`No changes made to ${planter.print.name()}.`);
        }
      })
      // Exit early since we already wrote the data
      return;
      
    } else {
      // Force delete planter
      deleteData();
      logDelete();
    }
  }

  if (options.name) {
    if (planterExists(planters[options.name])) {
      error(`Planter ${Planter.print.error(options.name)} already exists.`);
    }

    // Copy then delete the old planter
    const copy = Object.assign(new Planter(options.name), planter)
    planters[options.name] = copy;
    logger.info(`Updated name: ${planter.print.name()} → ${copy.print.name()}`);
    deleteData();
  }

  if (options.location) {
    if (planter.location !== options.location) {
      const curr = planter.print.location();
      planter.location = options.location;
      logger.info(`Updated location of ${planter.print.name()}: ${curr} → ${planter.print.location()}`);

    } else {
      logger.info(`Location of ${planter.print.name()} already set to: ${planter.print.location()}`);
      // Exit early since we didn't make any changes
      return;
    }
  }

  if (options.remote) {
    planter.type = 'remote';
    logger.info(`Updated type of ${planter.print.name()} to ${planter.print.type()}`);
  } else if (options.local) {
    planter.type = 'local';
    logger.info(`Updated type of ${planter.print.name()} to ${planter.print.type()}`);
  }

  writeData();
}