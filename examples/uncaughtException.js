const ace = require('../')

const app = ace.createApp()

throw new Error('What the deuce!?')

app.use(ctx => (ctx.body = 'Hello World!'))

app.start('http://localhost:3000')
