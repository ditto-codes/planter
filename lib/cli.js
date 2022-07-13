import { Command } from "commander";
import { create } from './create.js';
import { list } from './list.js';
import { test } from './test.js';

const cli = new Command();

cli
  .name('planter')
  .version('0.0.2')

// Define list of commands
const commands = [
  create,
  list,
  test,
];

// TODO: run getUserConfig here
// const config = await getUserConfig();

// Register all commands to the cli
commands.forEach((command) => command(cli));
// commands.forEach((command) => command(cli, config));

// Run the cli
export default () => {
  cli.parse(process.argv);
}