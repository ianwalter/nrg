const nrg = require('@ianwalter/nrg')

// Export an API "adapter" function used to wrap the API handlers.
module.exports = function adapter (handler) {
  // Create the nrg app instance.
  const app = nrg.createApp({
    log: { level: 'info' },
    plugins: {
      // Disable the httpsRedirect middleware since this is only for the API.
      httpsRedirect: false,
      // Disable the body parser middleware since Next.js already uses one.
      bodyParser: false,
      // Disable the compression middleware since Next.js already uses one.
      compress: false,
      // Disable the router since routing is handled by Next.js.
      router: false,
      // Don't add the serve function since serving is handled by Next.js.
      serve: false
    }
  })

  // Tell the app to use the given handler as the last middleware.
  app.use(handler)

  // Use the app callback as the "handler".
  return async (req, res) => app.callback()(req, res)
}
