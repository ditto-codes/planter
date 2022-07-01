#!/usr/bin/env node

import { Command } from "commander";
import { create } from './create.js';
import { list } from './list.js';

const cli = new Command();

cli
  .name('planter')
  .version('0.0.2')

// Define list of commands
const commands = [
  create,
  list,
];

// Register all commands to the cli
commands.forEach((command) => command(cli));

// Run the cli
export default () => {
  cli.parse(process.argv);
}
