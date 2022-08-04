export default class Planter {
  constructor(loc, isDir, pos, time = null) {
    this.location = loc;
    this.isDirectory = isDir;
    this.position = pos;
    this.unixTimestamp = time ? time : Math.floor(new Date().getTime() / 1000);
  }

  get creationTime() {
    return new Date(this.unixTimestamp * 1000).toLocaleString()
  }
}