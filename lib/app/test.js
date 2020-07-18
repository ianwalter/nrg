module.exports = function test (url, options = {}) {
  const app = this
  const supertest = require('supertest')
  const cb = app.callback()
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
