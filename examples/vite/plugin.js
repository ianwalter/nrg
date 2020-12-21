import mount from 'koa-mount'
import app from './app/index.js'

export default {
  configureServer: server => server.app.use(mount(app))
}
