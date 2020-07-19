const merge = require('@ianwalter/merge')
const Koa = require('koa')
const config = require('./config')
const start = require('./app/start')
const test = require('./app/test')

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

  // Add the logger to the app instance for convenience.
  if (cfg.logger) app.log = cfg.logger

  // If configured, set up handlers for any uncaught exceptions and unhandled
  // Promise rejections that happen within the current process.
  if (cfg.log?.unhandled) {
    // FIXME: use synchronous logger instances for this.
    process.on('unhandledRejection', err => app.log.error(err))
    process.on('uncaughtException', err => app.log.error(err))
  }

  // If session keys are configured, add them to the app.
  if (cfg.keys) app.keys = cfg.keys

  // Iterate over all of the configured plugins and integrate them with the app.
  for (const plugin of Object.values(cfg.plugins)) {
    if (plugin) plugin(app)
  }

  // Add a start method to the app that makes it easy to start listening for
  // connections.
  app.start = start

  // If not in production, add a utility to allow making test requests.
  if (!cfg.isProd) app.test = test

  // Return the app instance.
  return app
}
