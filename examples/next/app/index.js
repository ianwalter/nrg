const nrg = require('@ianwalter/nrg')
const next = require('next')

const app = nrg.createApp()

const it = next({ dev: app.isDev, dir: __dirname })
const nextMiddleware = ctx => it.render(ctx.req, ctx.res, ctx.url, ctx.query)
it.prepare().then(() => app.use(nextMiddleware))

module.exports = app
