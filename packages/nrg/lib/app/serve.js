const http = require('http')
const merge = require('@ianwalter/merge')
const enableDestroy = require('server-destroy')

module.exports = function serve () {
  // FIXME: comment
  this.server = http.createServer(this.callback())

  return new Promise(resolve => {
    this.server.listen(this.port, this.host, err => {
      if (err) {
        if (this.log) this.log.error(err)
        process.exit(1)
      }

      // Update the port in the config in case it wasn't specified and Node
      // has used a random port.
      if (!this.context.cfg.port) {
        const { port } = this.server.address()
        merge(this.context.cfg, { port })
      }

      // Set the server URL (the local URL which can be different from the
      // base URL) so that whatever is starting the server (e.g. tests) can
      // easily know what URL to use.
      this.server.url = this.context.cfg.hostUrl

      if (this.log) {
        this.log
          .ns('nrg.server')
          .info(`${this.context.cfg.name} server started:`, this.server.url)
      }

      // Add a destroy method to the server instance.
      // https://github.com/nodejs/node/issues/2642
      enableDestroy(this.server)

      // Add a close method to the app to allow the caller / receiver of the
      // app to close the server when it's done with it.
      this.close = () => new Promise(resolve => this.server.destroy(resolve))

      resolve(this)
    })
  })
}
