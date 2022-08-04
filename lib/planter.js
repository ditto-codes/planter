import { format, parse } from 'date-fns';
import printers from './printers.js';
import chalk from 'chalk';

export default class Planter {
  #name;
  #createdFormat = 'yyyy-MM-dd-HH:mm:ssx';
  #printers;
  
  constructor(name, loc, isDir = false, pos = null, time = new Date()) {
    this.#name = name;
    this._location = loc;
    this._isDirectory = isDir;
    this._position = pos;
    this._created = format(time, this.#createdFormat);

    this.#printers = {
      name: () => printers.name(this.#name),
      location: () => printers.location(this._location),
      position: () => printers.position(this._position),
      created: ()=> {
        const datetime = parse(this._created, this.#createdFormat, new Date());
        const date = format(datetime, 'MMM d, yyyy');
        const time = format(datetime, 'pp');
        // Aug 4, 2022 12:55:08 AM
        return printers.created(date, time);
      },
      listItem: () => printers.listItem(this.#name, !!this._position),
    }
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
    return this.#printers;
  }

  static print = printers;

  // function print()

  unpin() {
    this._position = null;
  }
}


