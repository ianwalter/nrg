const { createApp } = require('@ianwalter/nrg')

// Create the application instance.
const app = createApp()

// Add some endpoints.
app.get('/hello', ctx => (ctx.body = 'Hello World!'))
app.delete('/self', ctx => (ctx.body = 'Goodbye, cruel world.'))

// Start the app server.
app.serve()
