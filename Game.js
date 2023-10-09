const { generateId } = require('./helpers')
const Timer = require('./Timer')

class Game {
  constructor(isPublic = false) {
    this.id = generateId()
    this.moves = []
    this.players = []
    this.gameLength = 1000 * 60 * 10
    this.time = [this.gameLength, this.gameLength]
    this.timer = new Timer()
    this.timer.onTimerEnd = (timer) => {
      this.setGameOver({
        winner: this.turn === 0 ? 1 : 0,
        result: this.turn === 0 ? '0-1' : '1-0',
        reason: 'timeout'
      })
    }
    this.isPublic = isPublic
    this.gameOver = null
    this.turn = 0
    this.timeout = null;
    this._onGameOver = function() { }
    this.started = false
    this.active = [true, true]
    this.interval = null
    this.lastTick = null
  }
  join(id, username) {
    if (!username) username = "Guest"
    console.log('User: ' + username)
    let playerIndex = this.players.findIndex(p => p.id === id)
    if (playerIndex === -1) {
      // if (this.players.length >= 2) return false
      if (this.players.length === 0) {
        this.active[0] = true
      } else {
        this.active[1] = true
      }
      this.players.push({ id, username })
    }
    return true
  }
  handleTime() {
    if (this.interval) {
      clearInterval(this.interval)
    }
    this.interval = setInterval(() => {
      let amt = this.lastTick == null ? 0 : Date.now() - this.lastTick
      this.lastTick = Date.now()
      this.time[this.turn] -= amt
      if (this.time[this.turn] <= 0) {
        this.setGameOver({
          winner: this.turn === 0 ? 1 : 0,
          result: this.turn === 0 ? '0-1' : '1-0',
          reason: 'timeout'
        })
        clearInterval(this.interval)
      }
    }, 100)
  }
  data() {
    return {
      id: this.id,
      moves: this.moves,
      players: this.players,
      time: this.timer.time,
      turn: this.turn,
      gameOver: this.gameOver,
      isPublic: this.isPublic
    }
  }
  start() {
    if (this.started) return
    this.lastMoveTime = Date.now()
    this.started = true
    this.timer.start()
  }
  setGameOver(data) {
    if (this.timeout) {
      clearTimeout(this.timeout)
    }
    if (this.interval) {
      clearInterval(this.interval)
    }
    let amt = this.lastTick || Date.now()
    this.time[this.turn] -= Date.now() - amt
    this.timer.stop()
    this.gameOver = data
    this._onGameOver(this.gameOver)
  }
  set onGameOver(cb) {
    this._onGameOver = cb
  }
  move(move, sendTime) {
    this.moves.push(move)
    let ping = Date.now() - sendTime
    // this.time[this.turn] += ping
    let amt = this.lastTick || Date.now()
    this.timer.swap(sendTime)
    this.turn = this.turn === 0 ? 1 : 0
    this.lastMoveTime = Date.now()
  }
  runRematch() {
    this.players = this.players.reverse()
    this.time = [this.gameLength, this.gameLength]
    this.timer.reset()
    this.gameOver = null
    this.started = false
    this.lastMoveTime = null
    this.turn = 0
    this.moves = []
  }
}

module.exports = Game