import { test } from '@ianwalter/bff'
import Sentry from '@sentry/node'
import Integrations from '@sentry/integrations'
import sentryTestkit from 'sentry-testkit'
import { createApp } from '@ianwalter/nrg'
import nrgSentry from './index.js'

test('Error', async t => {
  const { testkit, sentryTransport } = sentryTestkit()
  Sentry.init({
    dsn: 'https://abc123@a321.ingest.sentry.io/123',
    transport: sentryTransport,
    tracesSampleRate: 1.0,
    integrations: [
      new Integrations.Transaction()
    ]
  })

  const app = createApp({ plugins: { ...nrgSentry() } })
  app.get('/', () => { throw new Error('Bow to the cow') })

  const res = await app.test('/').get()

  // Wait for the asynchronous error reporting flow to complete.
  await t.asleep(100)

  // t.print.log('testkit.reports()[0]', testkit.reports()[0])
  t.expect(res.statusCode).toBe(500)
  t.expect(res.body).toBe('Internal Server Error')
  t.expect(testkit.reports()[0].error.message).toBe('Bow to the cow')

  // FIXME: how do I test tracing?
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
