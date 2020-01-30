const { createApp, requireAuthorization } = require('../')

const app = createApp()

app.get('/', ctx => (ctx.body = 'Hello World!'))
app.get('/private', requireAuthorization, ctx => (ctx.body = 'Secretsss'))

app.start()
