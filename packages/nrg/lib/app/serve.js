import http from 'http'
import getHostUrl from '../utilities/getHostUrl.js'

export function serve (port, hostname, callback) {
  // Create the server instance by specifying the app's callback as the
  // handler.
  const server = http.createServer(callback || this.callback())

  // Prefer the port and hostname passed as arguments to those configured in
  // the app even if the port is 0 (which means use a random unused port) so
  // that they can be overridden when serving (e.g. in a test).
  const portToUse = port !== undefined ? port : (this.context.cfg.port || 0)
  const hostnameToUse = hostname || this.context.cfg.hostname

  return new Promise(resolve => {
    server.listen(portToUse, hostnameToUse, err => {
      if (err) {
        if (this.logger) this.logger.error(err)
        process.exit(1)
      }

      // Set the server URL (the local URL which can be different from the
      // base URL) so that whatever is starting the server (e.g. tests) can
      // easily know what URL to use.
      port = portToUse || server.address().port
      server.url = getHostUrl(hostnameToUse, port)

      if (this.logger) {
        this.logger
          .ns('nrg.server')
          .info(`${this.context.cfg.name} server started:`, server.url)
      }

      // Add a destroy method to the server instance if not in a production
      // environment (e.g. development or test).
      // https://github.com/nodejs/node/issues/2642
      // Logic influenced by https://github.com/isaacs/server-destroy
      if (!this.context?.cfg?.isProd) {
        const sockets = []

        // Keep track of all active connections.
        server.on('connection', socket => {
          const index = sockets.push(socket) - 1
          socket.on('close', () => sockets.splice(index, 1))
        })

        // Add a destroy method to the server instance that closes the server
        // and destroys all active connections.
        server.destroy = () => new Promise(resolve => server.close(() => {
          for (const socket of sockets) socket.destroy()
          setTimeout(resolve)
        }))
      }

      // Return the server instance.
      resolve(server)
    })
  })
}

export function install (app, ctx) {
  if (ctx.logger) ctx.logger.debug('Adding serve method')
  app.serve = serve
}
