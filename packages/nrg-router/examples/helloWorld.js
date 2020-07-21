const { createApp } = require('@ianwalter/nrg')
const { addRouter } = require('..')

//
const app = createApp()

//
addRouter(app)

//
app.get('/hello', ctx => (ctx.body = 'Hello World!'))
app.delete('/self', ctx => (ctx.body = 'Goodbye, cruel world.'))

//
app.start('http://localhost:3000')
