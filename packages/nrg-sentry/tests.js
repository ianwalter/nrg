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
  await t.asleep(100)

  t.expect(res.statusCode).toBe(500)
  t.expect(res.body).toBe('Internal Server Error')
  t.expect(testkit.reports()[0].error.message).toBe('Bow to the cow')
})

test('Warning', async t => {
  const { testkit, sentryTransport } = sentryTestkit()
  Sentry.init({
    dsn: 'https://abc123@a321.ingest.sentry.io/123',
    transport: sentryTransport,
    tracesSampleRate: 1.0
  })

  const app = createApp({ plugins: { ...nrgSentry() } })
  app.get('/', () => {
    const err = new Error('Woop! Woop! Thats the sound of the police')
    err.status = 400
    err.logLevel = 'warn'
    err.body = 'Thats the sound of the beast'
    throw err
  })

  const res = await app.test('/').get()

  // Wait for the asynchronous error reporting flow to complete.
  await t.asleep(100)

  t.expect(res.statusCode).toBe(400)
  t.expect(res.body).toBe('Thats the sound of the beast')
  t.expect(testkit.reports()).toEqual([])
})
