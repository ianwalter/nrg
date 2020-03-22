const { requester } = require('@ianwalter/requester')

module.exports = function healthcheck (app, options) {
  const interval = setInterval(() => {
    try {
      await requester.get('/health')
      clearInterval(interval)
      app.log.success()
    } catch (err) {
      if (count) {
        clearInterval(interval)
        app.log.fatal()
        process.exit(1)
      }
    }
  })
}
