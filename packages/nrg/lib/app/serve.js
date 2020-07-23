const http = require('http')
const getHostUrl = require('../utilities/getHostUrl')

module.exports = function serve (port, hostname) {
  // Create the server instance by specifying the app's callback as the handler.
  const server = http.createServer(this.callback())

  const portToUse = port !== undefined ? port : (this.context.cfg.port || 0)
  const hostnameToUse = hostname || this.context.cfg.hostname

  return new Promise(resolve => {
    server.listen(portToUse, hostnameToUse, err => {
      if (err) {
        if (this.log) this.log.error(err)
        process.exit(1)
      }

      // Set the server URL (the local URL which can be different from the
      // base URL) so that whatever is starting the server (e.g. tests) can
      // easily know what URL to use.
      server.url = getHostUrl(hostnameToUse, portToUse || server.address().port)

      if (this.log) {
        this.log
          .ns('nrg.server')
          .info(`${this.context.cfg.name} server started:`, server.url)
      }

      // Add a destroy method to the server instance.
      // https://github.com/nodejs/node/issues/2642
      // enableDestroy(server)

      // FIXME: comment
      if (!this.context.cfg.isProd) {
        const connections = {}

        server.on('connection', connection => {
          const key = connection.remoteAddress + ':' + connection.remotePort
          connections[key] = connection
          connection.on('close', () => (delete connections[key]))
        })

        server.destroy = () => new Promise(resolve => server.close(() => {
          for (const key of Object.keys(connections)) connections[key].destroy()
          resolve()
        }))
      }

      // Return the server instance.
      resolve(server)
    })
  })
}
