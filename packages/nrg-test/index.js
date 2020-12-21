import { Requester } from '@ianwalter/requester'
import { serve } from '@ianwalter/nrg'

const requester = new Requester({ shouldThrow: false })

export function install (app, ctx, cfg) {
  if (ctx.logger) ctx.logger.debug('TODO:')

  app.test = function test (path, options) {
    // If options has a statusCode, treat it as a response to a previous request
    // and try to extract headers from it to be reused for current request to
    // make it more convenient when writing tests with successive test requests.
    if (options?.statusCode) {
      const { headers } = options.request.options
      const cookie = options.headers['set-cookie'] || headers.cookie
      const csrf = headers['csrf-token']
      options = { headers: {} }
      if (cookie) options.headers.cookie = cookie
      if (csrf) options.headers['csrf-token'] = csrf
      if (app.log) {
        app.logger.ns('nrg.test').debug(
          `Extracted options for ${path} test request`,
          options
        )
      }
    }

    return {
      async get () {
        return this.request('get', options)
      },
      async post (body) {
        return this.requestWithCsrf('post', { ...options, body })
      },
      async put (body) {
        return this.requestWithCsrf('put', { ...options, body })
      },
      async delete (body) {
        return this.requestWithCsrf('delete', { ...options, body })
      },
      async request (method, options) {
        let server
        if (app.serve) {
          server = await app.serve(0)
        } else if (app.next) {
          const { default: next } = await import('next')
          const nextApp = next({ dev: app.isDev })
          await nextApp.prepare()
          server = await serve(0, 'localhost', nextApp.getRequestHandler())
        } else {
          server = await serve(0, 'localhost', app.callback())
        }

        const response = await requester[method](server.url + path, options)
        await server.destroy()
        return response
      },
      async requestWithCsrf (method, options) {
        const headers = options?.headers
        if (cfg.test?.csrfPath && (!headers || !headers['csrf-token'])) {
          const logger = app.logger && app.logger.ns('nrg.test')
          if (logger) {
            logger.debug(`Adding CSRF token for ${method} ${path} test request`)
          }

          // Make a request to the CSRF token endpoint to get a CSRF token for
          // the test request.
          const response = await test(cfg.test.csrfPath).get(options)

          // Add the CSRF token and session cookie to the request headers.
          const csrfToken = response.body.csrfToken
          const cookie = response.headers['set-cookie']
          options.headers = {
            ...options.headers,
            ...csrfToken ? { 'csrf-token': csrfToken } : {},
            ...cookie ? { cookie } : {}
          }

          if (logger) {
            logger.debug(
              `Modified options for ${method} ${path} test request`,
              options
            )
          }
        }

        return this.request(method, options)
      }
    }
  }
}
