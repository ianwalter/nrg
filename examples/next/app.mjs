import { createApp } from '@ianwalter/nrg'
import hello from './api/hello.mjs'

// Create the nrg app instance.
export const app = createApp({
  log: { level: 'info' },
  next: { enabled: true }
})

// Set up some data on the request context for the example showing how to access
// server-side data using getServerSideProps.
app.use((ctx, next) => {
  ctx.state.example = 'I am from ctx.state!'
  return next()
})

app.ready().then(() => {
  // An example of an API route.
  app.get('/api/hello', hello)
})
