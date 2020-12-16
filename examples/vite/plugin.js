import mount from 'koa-mount'
import app from './app/index.js'

module.exports = {
  configureServer: server => server.app.use(mount(app))
}
