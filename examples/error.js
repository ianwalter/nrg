const ace = require('../')

const app = ace.createApp()

app.use(ctx => {
  throw new Error('Oh noes!')
})

app.start('http://localhost:3000')
