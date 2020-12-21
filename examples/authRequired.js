import { createApp, requireAuthorization } from '../index.js'

const app = await createApp({ keys: ['sh00k1s'] })

app.get('/', ctx => (ctx.body = 'Hello World!'))
app.get('/private', requireAuthorization, ctx => (ctx.body = 'Secretsss'))

app.serve()
