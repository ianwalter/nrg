const { createApp } = require('../..')

const app = createApp({ static: { enabled: true } })

app.start('http://localhost:3000')
