const app = require('./base')

app.use(ctx => (ctx.body = 'Hello World!'))

module.exports = app
