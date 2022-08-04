import { format, parse } from 'date-fns';
import printers from './printers.js';

export default class Planter {
  // // Private variables
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

  unpin() {
    this._position = null;
  }

  // GETTERS
  // ────────────────────────────────────  

  // Print helper(s)
  get print() {
    return this.#printers;
  }

  // Get created as a Unix timestamp for sorting
  get unixTimestamp() {
    const date = parse(this._created, this.#createdFormat, new Date());
    return Math.floor(new Date(date).getTime() / 1000);
  }

  // Derive the type as a string, based on isDirectory
  get type() {
    if (this._isDirectory) return 'directory';
    else return 'remote';
  }

  get name() {
    return this.#name;
  }

  get location() {
    this._location;
  }

  get position() {
    return this._position;
  }

  // SETTERS
  // ────────────────────────────────────

  set name(name) {
    this.#name = name;
  }

  set location(loc) {
    this._location = loc;
  }

  set position(pos) {
    this._position = pos;
  }

  set isDirectory(isDir) {
    this._isDirectory = !!isDir;
  }

  // STATIC
  // ────────────────────────────────────

  // Expose the printers for pretty printing varaibles
  // external to a Planter instance with the same styling
  static print = printers;

}