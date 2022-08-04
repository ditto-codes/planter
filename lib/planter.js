import { format, isThisSecond, parse } from 'date-fns';
import chalk from 'chalk';

export default class Planter {
  #name;
  #createdFormat = 'yyyy-MM-dd-HH:mm:ssx';
  
  constructor(name, loc, isDir = false, pos = null, time = new Date()) {
    this.#name = name;
    this._location = loc;
    this._isDirectory = isDir;
    this._position = pos;
    this._created = format(time, this.#createdFormat);
  }

  get unixTimestamp() {
    const date = parse(this._created, this.#createdFormat, new Date());
    return Math.floor(new Date(date).getTime() / 1000);
  }

  get name() {
    return this.#name;
  }

  get location() {
    this._location;
  }

  set name(name) {
    this.#name = name;
  }

  set location(loc) {
    this._location = loc;
  }

  get type() {
    if (this._isDirectory) return 'directory';
    else return 'remote';
  }

  set isDirectory(isDir) {
    this._isDirectory = !!isDir;
  }

  set position(pos) {
    this._position = pos;
  }

  get position() {
    return this._position;
  }

  get print() {
    return {
      name: chalk.green.bold(this.#name),
      location: chalk.cyan(this._location),
      position: chalk.yellow(this._position),
      created: (()=>{
        const datetime = parse(this._created, this.#createdFormat, new Date());
        const date = format(datetime, 'MMM d, yyyy');
        const time = format(datetime, 'pp');
        // Aug 4, 2022 12:55:08 AM
        return `${date} ${chalk.dim(time)}`;
      })(),
      listItem: (()=>{
        let prefix = chalk.dim('-');
        let name = this.#name;
        if (this._position) {
          prefix = chalk.yellow('*');
          name = chalk.green(name);
        }
        return (`  ${prefix} ${name}`)
      })(),
    }
  }

  unpin() {
    this._position = null;
  }
}
