module.exports = function close () {
  // Close any open database connections.
  const dbCallback = () => this.logger?.debug('Database connection destroyed')
  if (this.db) this.db.destroy(dbCallback)

  // Close any open redis connections.
  if (this.redis) this.redis.client.disconnect()

  if (this.mq) {
    // Silence channel ended error.
    this.mq.channel.on('error', err => this.logger.ns('nrg.mq').debug(err))

    // Close message queue connection.
    this.mq.connection.close()
  }
}
