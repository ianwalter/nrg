module.exports = function close () {
  // Close any open database connections.
  if (this.db) this.db.destroy()

  // Close any open redis connections.
  if (this.redis) this.redis.quit()

  if (this.mq) {
    // Silence channel ended error.
    this.mq.channel.on('error', err => this.log.ns('nrg.mq').debug(err))

    // Close message queue connection.
    this.mq.connection.close()
  }
}