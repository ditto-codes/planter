import { format, parse } from 'date-fns';
import printers from './printers.js';

export default class Planter {
  // Static variables
  
  // Expose the printers for pretty printing varaibles external to
  // a Planter instance with the same styling this class uses
  static print = printers;

  // Expose the added format string, in case we need it elsewhere
  // Reference: https://date-fns.org/v2.29.1/docs/format
  static addedDateFormat = 'yyyy-MM-dd-HH:mm:ssx';

  // // Private variables
  #name;
  #printers;
  #addedFormat = Planter.addedDateFormat;
  
  constructor(name, props = {}) {
    const { 
      location, 
      type = 'remote',
      position = null, 
      added = new Date() 
    } = props;

    this.#name = name;
    this._location = location;
    this._type = type;
    this._position = position;
    this._added = (typeof added !== 'string') 
      ? format(added, this.#addedFormat) 
      : added;

    this.#printers = {
      name: () => printers.name(this.#name),
      location: () => printers.location(this._location),
      position: () => printers.position(this._position),
      type: () => printers.type(this._type),
      added: ()=> {
        const datetime = parse(this._added, this.#addedFormat, new Date());
        const date = format(datetime, 'MMM d, yyyy');
        const time = format(datetime, 'pp');
        // Aug 4, 2022 12:55:08 AM
        return printers.added(date, time);
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

  // Get added as a Unix timestamp for sorting
  get unixTimestamp() {
    const date = parse(this._added, this.#addedFormat, new Date());
    return Math.floor(new Date(date).getTime() / 1000);
  }

  get type() {
    return this._type;
  }

  get name() {
    return this.#name;
  }

  get location() {
    return this._location;
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

  set type(type) {
    this._type = type;
  }

  set position(pos) {
    this._position = pos;
  }

  set isDirectory(isDir) {
    this._isDirectory = !!isDir;
  }
}