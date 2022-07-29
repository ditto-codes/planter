import inquirer from 'inquirer';
import chalk from 'chalk';
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
    .option('-f, --force', 'Edit something... dangerously. (Force the edit without any prompts.)', false)
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
 * @param {Object} the config object, including its file path
 */
function run(input, config) {
  const { args, options } = input;
  const { name } = args;
  const { planters } = config.Config;

  const f = chalk.green.bold;

  if (!planters[name]) {
    // TODO: handle planter doesn't exist
    logger.warn(`Planter ${f(name)} does not exist.`)
    return;
  }

  // TODO: log stuff for all of these

  const deleteData = () => {
    delete planters[name];
  }

  const writeData = () => {
    updateUserConfig(config);
  }

  if (options.delete) {
    const logDelete = () => {
      logger.info(`Removed ${f(name)} from your list.`);
    }
    if (!options.force) {
      let question = {
        name: 'confirmDelete',
        type: 'confirm',
        prefix: '',
        message: chalk.yellow(`Planter ${f(name)} ${`will be removed from your list. Are you sure?`}`),
      }
      inquirer.prompt([question]).then((answers) => {
        if (answers['confirmDelete']) {
          deleteData();
          writeData();
          logDelete();
        } else {
          logger.info(`No changes made to ${f(name)}.`);
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
    planters[options.name] = { ...planters[name] };
    deleteData();
    logger.info(`Updated name: ${f(name)} → ${f(options.name)}`)
  }

  if (options.location) {
    const { location } = planters[name];
    let l = chalk.cyan.bold;
    planters[name].location = options.location;
    logger.info(`Updated location of ${f(name)}: ${l(location)} → ${l(options.location)}`)
  }

  writeData();
}