const { createApp, authRequired } = require('../')

const app = createApp()

app.get('/', ctx => (ctx.body = 'Hello World!'))
app.get('/private', authRequired, ctx => (ctx.body = 'Secrets secrets secrets'))

app.start()
