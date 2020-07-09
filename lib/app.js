// Load environment variables from .env file.
require('dotenv').config()

const http = require('http')
const merge = require('@ianwalter/merge')
const Koa = require('koa')
const enableDestroy = require('server-destroy')
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

  // Add the logger to the app instance for convenience.
  if (cfg.logger) app.log = cfg.logger

  // FIXME: move this to print.
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
  app.start = function start () {
    // FIXME: comment
    app.server = http.createServer(app.callback())

    return new Promise(resolve => {
      app.server.listen(cfg.port, cfg.host, err => {
        if (err) {
          if (app.log) app.log.error(err)
          process.exit(1)
        }

        // Update the port in the config in case it wasn't specified and Node
        // has used a random port.
        if (!cfg.port) {
          const { port } = app.server.address()
          merge(cfg, { port })
        }

        // Set the server URL (the local URL which can be different from the
        // base URL) so that whatever is starting the server (e.g. tests) can
        // easily know what URL to use.
        app.server.url = cfg.hostUrl

        // NOTE: pino is not including the URL in the message if passed as the
        // second param here.
        if (app.log) {
          app.log
            .ns('nrg.server')
            .info(`${cfg.name} server started:`, app.server.url)
        }

        // Add a destroy method to the server instance.
        // https://github.com/nodejs/node/issues/2642
        enableDestroy(app.server)

        // Add a close method to the app to allow the caller / receiver of the
        // app to close the server when it's done with it.
        app.close = function close () {
          return new Promise(resolve => app.server.destroy(resolve))
        }

        resolve(app)
      })
    })
  }

  app.test = function test (url, options = {}) {
    const supertest = require('supertest')
    const cb = this.callback()
    const request = supertest(cb)

    // If options is a re-used response object, re-use cookie and CSRF token
    // values in request headers.
    if (options.status) {
      // Supertest does not like a undefined headers.
      const headers = options.request.header
      const Cookie = options.headers['set-cookie'] || headers.Cookie
      const csrf = headers['csrf-token']
      options = {
        ...Cookie ? { Cookie } : {},
        ...csrf ? { 'csrf-token': csrf } : {}
      }
      if (app.log) app.log.ns('nrg.test').debug('Test request options', options)
    }

    return {
      post (data) {
        return this.runWithCsrf(request.post(url).set(options).send(data))
      },
      put (data) {
        return this.runWithCsrf(request.put(url).set(options).send(data))
      },
      get () {
        return this.run(request.get(url).set(options))
      },
      delete () {
        return this.runWithCsrf(request.delete(url).set(options))
      },
      run (request) {
        return new Promise(resolve => request.end((_, res) => resolve(res)))
      },
      async runWithCsrf (request) {
        if (app.keys?.length && !options['csrf-token']) {
          if (app.log) {
            app.log.ns('nrg.test').debug('Adding CSRF token for test')
          }
          const response = await supertest(cb).get('/csrf-token').set(options)
          request.set('Cookie', response.headers['set-cookie'])
          request.set('csrf-token', response.body.csrfToken)
        }
        return this.run(request)
      }
    }
  }

  // Return the app instance.
  return app
}
