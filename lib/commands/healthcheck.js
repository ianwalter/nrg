const { requester } = require('@ianwalter/requester')

module.exports = function healthcheck () {
  const interval = setInterval(() => {
    try {
      await requester.get('/health')
      clearInterval(interval)
      ctx.log.success()
    } catch (err) {
      if (count) {
        clearInterval(interval)
        ctx.log.fatal()
        process.exit(1)
      }
    }
  })
}
