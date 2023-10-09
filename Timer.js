class Timer {
  constructor() {
    this.init()
  }
  init() {
    this.turn = 0
    let timerLength = 1000 * 60 * 10
    this.time = [timerLength, timerLength]
    this.lastTick = null
    this.started = false
    this.timeout = null
  }
  swap(sendTime) {
    let now = Date.now()
    let ping = now - sendTime
    this.time[this.turn] += ping
    this.time[this.turn] -= now - (this.lastTick || now)
    this.lastTick = now
    this.turn = (this.turn + 1) % 2
    if (this.timeout) {
      clearTimeout(this.timeout)
    }
    this.timeout = setTimeout(() => {
      this.started = false
      if (this.onTimerEnd) {
        this.onTimerEnd(this)
      }
    }, this.time[this.turn])
  }
  currentTime(player) {
    let now = Date.now()
    return this.turn === player ? this.time[this.turn] - (now - (this.lastTick || now)) : this.time[player]
  }
  start() {
    this.lastTick = Date.now()
    this.started = true
  }
  stop() {
    this.lastTick = null
    this.started = false
    clearTimeout(this.timeout)
    this.timeout = null
  }
  reset() {
    this.init()
  }
}

module.exports = Timer