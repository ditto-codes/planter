import chalk from 'chalk';

const printers = {
  name: s => chalk.green.bold(s),
  location: s => chalk.cyan(s),
  position: s => chalk.yellow(s),
  created: (s1, s2) => `${s1} ${chalk.dim(s2)}`, 
  listItem: (s, pinned) => {
    let prefix = chalk.dim('-');
    let name = s;
    if (pinned) {
      prefix = chalk.yellow('*');
      name = chalk.green(name);
    }
    return (`  ${prefix} ${name}`); 
  },
}

export default printers;