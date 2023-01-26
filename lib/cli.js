import { Command } from "commander";
import chalk from 'chalk';
import create from './commands/create.js';
import list from './commands/list.js';
import add from './commands/add.js';
import edit from './commands/edit.js';
import pin from './commands/pin.js';
import info from './commands/info.js';
import { addCompletionSpecCommand } from '@fig/complete-commander'

// Initialize the CLI program
const cli = new Command();

cli
  .name('planter')
  .version('0.0.2')
  .configureOutput({
    outputError: (str, write) => write(chalk.red.bold(str))
  })

// Fig (https://fig.io/docs/guides/integrating/integrations/commander)
if (process.env.NODE_ENV === 'development') {
  addCompletionSpecCommand(cli);
}

// Define list of commands
const commands = [
  create,
  list,
  add,
  edit,
  pin,
  info,
];

// Register all commands to the cli
commands.forEach((command) => command(cli));

// Run the cli
export default () => {
  cli.parse(process.argv);
}