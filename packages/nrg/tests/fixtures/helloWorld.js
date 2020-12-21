import { app } from './base.js'

app.use(ctx => (ctx.body = 'Hello World!'))

export { app }
