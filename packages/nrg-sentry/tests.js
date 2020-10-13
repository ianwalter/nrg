const { test } = require('@ianwalter/bff')
const Sentry = require('@sentry/node')
const sentryTestkit = require('sentry-testkit')
const { createApp } = require('@ianwalter/nrg')
const nrgSentry = require('.')

test('Error', async t => {
  const { testkit, sentryTransport } = sentryTestkit()
  Sentry.init({
    dsn: 'https://abc123@a321.ingest.sentry.io/123',
    transport: sentryTransport,
    tracesSampleRate: 1.0
  })

  const app = createApp({ plugins: { ...nrgSentry() } })
  app.get('/', () => { throw new Error('Bow to the cow') })

  const res = await app.test('/').get()

  // Wait for the asynchronous error reporting flow to complete.
  await t.asleep(500)

  t.expect(res.statusCode).toBe(500)
  t.expect(res.body).toBe('Internal Server Error')
  t.expect(testkit.reports()[0].error.message).toBe('Bow to the cow')
})
