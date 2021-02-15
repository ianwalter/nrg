import nrg from '@ianwalter/nrg'
import hello from './api/hello.js'

// Create the nrg app instance.
const app = nrg.createApp({
  log: { level: 'info' },
  next: { enabled: true }
})

// Set up some data on the request context for the example showing how to access
// server-side data using getServerSideProps.
app.use((ctx, next) => {
  ctx.state.example = 'I am from ctx.state!'
  return next()
})

// An example of an API route.
app.get('/api/hello', hello)

export default app
