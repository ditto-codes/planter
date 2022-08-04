import { format, parse } from 'date-fns';

export default class Planter {
  
  constructor(loc, isDir, pos, time = null) {
    this.location = loc;
    this.isDirectory = isDir;
    this.position = pos;
    // 2021-10-05THH:MM:SS  
    this.created = time ? time : format(new Date(), this.createdFormat());
  }

  createdFormat() {
    return 'yyyy-MM-dd-HH:mm:ssx';
  }

  // 12048500231
  get unixTimestamp() {
    return Math.floor(new Date(this.created).getTime() / 1000);
  }

  // May 10, 2021 10:41:11 pm
  // FIXME: This is goofed with default JSON data
  get creationTime() {
    const date = parse(this.created, this.createdFormat(), new Date());
    return format(date, 'MMM d, yyyy pp');
  }
}