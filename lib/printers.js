import chalk from 'chalk';

const printers = {
  name: s => chalk.green.bold(s),
  location: s => chalk.cyan(s),
  type: s => chalk.cyan(s),
  position: s => chalk.yellow(s),
  added: (s1, s2) => `${s1} ${chalk.dim(s2)}`, 
  listItem: (s, pinned) => {
    let prefix = chalk.dim('-');
    let name = s;
    if (pinned) {
      prefix = chalk.yellow('*');
      name = chalk.green(name);
    }
    return (`  ${prefix} ${name}`); 
  },
  error: s => chalk.white(s),
}

export default printers;