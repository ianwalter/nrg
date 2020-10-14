const { merge } = require('@generates/merger')
const Koa = require('koa')
const config = require('./config')

// If running in a CLI context, parse the JSON string to get the CLI options.
const nrgCli = process.env.NRG_CLI && JSON.parse(process.env.NRG_CLI)

module.exports = function createApp (options = {}) {
  // Combine defaults, CLI-supplied options, and user-supplied options.
  const cfg = merge(config(options), options, nrgCli)

  // Create the Koa app instance.
  const app = new Koa()

  // Tell Koa not to output all errors to `stderr` since they will already be
  // logged.
  app.silent = true

  // Add the config to the app context so that they can be referenced elsewhere
  // in the app.
  app.context.cfg = cfg

  // Configure the number of lines captured in an Error's stack trace so that
  // it's easier to debug errors in development.
  const stackTraceLimitIsInt = Number.isInteger(cfg.stackTraceLimit)
  if (stackTraceLimitIsInt) Error.stackTraceLimit = cfg.stackTraceLimit

  // If configured, set up handlers for any uncaught exceptions and unhandled
  // Promise rejections that happen within the current process.
  if (cfg.log?.unhandled) {
    // FIXME: use synchronous logger instances for this.
    process.on('unhandledRejection', err => app.logger.error(err))
    process.on('uncaughtException', err => app.logger.error(err))
  }

  // If session keys are configured, add them to the app.
  if (cfg.keys) app.keys = cfg.keys

  // If using a proxy, configure the app to accept proxy headers.
  if (cfg.proxy) app.proxy = cfg.proxy

  // Iterate over all of the configured plugins and integrate them with the app.
  const ctx = {}
  for (const plugin of Object.values(cfg.plugins)) if (plugin) plugin(app, ctx)

  // Return the app instance.
  return app
}
