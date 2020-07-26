const mount = require('koa-mount')
const app = require('./app')

module.exports = {
  configureServer: server => server.app.use(mount(app))
}
