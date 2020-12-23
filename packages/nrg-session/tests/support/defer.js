import { createApp } from '@ianwalter/nrg'
import session from '../../index.js'
import Store from './store.js'

const store = new Store()
export const app = await createApp({
  name: 'nrg defer session test',
  keys: ['keys', 'keykeys'],
  log: { level: 'error' },
  sessions: {
    key: 'koss:test_sid',
    cookie: {
      maxAge: 86400,
      path: '/session'
    },
    defer: true,
    store,
    reconnectTimeout: 100
  }
})

app.proxy = true // To support `X-Forwarded-*` header.

app.use(async (ctx, next) => {
  try {
    await next()
  } catch (err) {
    ctx.status = err.status || 500
    ctx.body = err.message
  }
})

// Will ignore repeat session.
app.use(session({
  key: 'koss:test_sid',
  cookie: {
    maxAge: 86400,
    path: '/session'
  },
  defer: true
}))

app.use(async function controllers (ctx) {
  switch (ctx.request.url) {
    case '/favicon.ico':
      ctx.status = 404
      break
    case '/wrongpath':
      ctx.body = ctx.session ? 'has session' : 'no session'
      break
    case '/session/rewrite':
      ctx.session = { foo: 'bar' }
      ctx.body = await ctx.session
      break
    case '/session/notuse':
      nosession(ctx)
      break
    case '/session/get':
      await get(ctx)
      break
    case '/session/nothing':
      await nothing(ctx)
      break
    case '/session/remove':
      await remove(ctx)
      break
    case '/session/httponly':
      await switchHttpOnly(ctx)
      break
    case '/session/regenerate':
      await regenerate(ctx)
      break
    case '/session/regenerateWithData':
      let session = await ctx.session
      session.foo = 'bar'
      session = await regenerate(ctx)
      ctx.body = { foo: session.foo, hasSession: session !== undefined }
      break
    default:
      await other(ctx)
  }
})

function nosession (ctx) {
  ctx.body = ctx._session !== undefined ? 'has session' : 'no session'
}

async function nothing (ctx) {
  ctx.body = String((await ctx.session).count)
}

async function get (ctx) {
  let session = await ctx.session
  session = await ctx.session
  session.count = session.count || 0
  session.count++
  ctx.body = String(session.count)
}

function remove (ctx) {
  ctx.session = null
  ctx.body = 0
}

async function switchHttpOnly (ctx) {
  const session = await ctx.session
  const httpOnly = session.cookie.httpOnly
  session.cookie.httpOnly = !httpOnly
  ctx.body = 'httpOnly: ' + !httpOnly
}

function other (ctx) {
  ctx.body = ctx.session ? 'has session' : 'no session'
}

async function regenerate (ctx) {
  const session = await ctx.regenerateSession()
  session.data = 'foo'
  ctx.body = ctx.sessionId
  return session
}
