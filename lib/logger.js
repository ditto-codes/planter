import chalk from 'chalk';

const log = console.log;
const error = console.error;

const logger = {

  info: (...input) => {
    log(...input);
  },

  whisper: (...input) => {
    log(chalk.dim(...input));
  },

  warn: (message) => {
    const color = chalk.yellowBright;
    log(color(`${message}`));
  },

  alert: (header, message) => {
    const color = chalk.yellow;
    if (header) log(color.bold(header));
    if (message) log(color(message));
  },

  error: (header, message, exit = false, trace) => {
    const color = chalk.red;
    const prefix = color.bold('Error: ');
    const _header = header 
      ? `${color.bold(header)}\n` 
      : '';
    const _message = message 
      ? `${color(message)}\n` 
      : '';

    let output = prefix + _header + _message;
    error(output);
    
    if (trace) error(trace);
    if (exit) process.exit(1);
  }
}

export default logger;