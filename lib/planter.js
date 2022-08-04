export default class Planter {
  constructor(loc, isDir, pos, time = null) {
    this.location = loc;
    this.isDirectory = isDir;
    this.position = pos;
    // 2021-10-05THH:MM:SS
    this.created = time ? time : new Date();
  }

  // 12048500231
  get unixTimestamp() {
    return Math.floor(new Date(this.created).getTime() / 1000);
  }

  // May 10, 2021 10:41:11 pm
  get creationTime() {
    return new Date(this.unixTimestamp * 1000).toLocaleString()
  }
}