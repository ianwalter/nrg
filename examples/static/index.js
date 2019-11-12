const { createApp } = require('../..')

const app = createApp({ static: true })

app.start('http://localhost:3000')
