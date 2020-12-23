import { createApp } from '@ianwalter/nrg'
import Store from './store.js'

const store = new Store()
export const app = await createApp({
  name: 'nrg rolling session test',
  keys: ['keys', 'keykeys'],
  log: { level: 'error' },
  sessions: {
    key: 'koss:test_sid',
    prefix: 'koss:test',
    ttl: 1000,
    cookie: {
      maxAge: 86400,
      path: '/session'
    },
    store,
    rolling: true
  }
})

app.proxy = true // To support `X-Forwarded-*` header.

app.use(function controllers (ctx) {
  switch (ctx.request.path) {
    case '/session/get':
      get(ctx)
      break
    case '/session/remove':
      remove(ctx)
      break
    case '/session/nothing':
      nothing(ctx)
  }
})

function get (ctx) {
  ctx.session.count = ctx.session.count || 0
  ctx.session.count++
  ctx.body = ctx.session.count
}

function remove (ctx) {
  ctx.session = null
  ctx.body = 0
}

function nothing (ctx) {
  ctx.body = 'do not touch session'
}
