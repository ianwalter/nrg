const { requester } = require('@ianwalter/requester')

module.exports = function healthcheck () {
  const stopInterval = setInterval(() => {
    try {
      await requester.get('/health')
      stopInterval()
      ctx.log.success()
    } catch (err) {
      if (count) {
        ctx.log.fatal()
        process.exit(1)
      }
    }
  })
}
