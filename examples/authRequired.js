const { createApp, requireAuthorization } = require('../')

const app = createApp({ keys: ['sh00k1s'] })

app.get('/', ctx => (ctx.body = 'Hello World!'))
app.get('/private', requireAuthorization, ctx => (ctx.body = 'Secretsss'))

app.serve()
