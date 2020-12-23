import uid from 'uid-safe'
import { createApp } from '@ianwalter/nrg'
import session from '../../index.js'
import Store from './store.js'

const store = new Store()
export const app = await createApp({
  name: 'nrg session test',
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
    store: store,
    genSid (len) {
      return uid.sync(len) + this.request.query.test_sid_append
    },
    beforeSave (ctx, session) {
      session.path = ctx.path
    },
    valid (ctx, session) {
      return ctx.query.valid !== 'false'
    },
    reconnectTimeout: 100
  }
})

app.keys = ['keys', 'keykeys']
app.outputErrors = true
app.proxy = true // to support `X-Forwarded-*` header

var store = new Store()

app.use(async (ctx, next) => {
  try {
    await next()
  } catch (err) {
    ctx.status = err.status || 500
    ctx.body = err.message
  }
})

app.use((ctx, next) => {
  if (ctx.request.query.force_session_id) {
    ctx.sessionId = ctx.request.query.force_session_id
  }
  return next()
})

app.use(session({

}))

// will ignore repeat session
app.use(session({
  key: 'koss:test_sid',
  cookie: {
    maxAge: 86400,
    path: '/session'
  },
  genSid: function (len) {
    return uid.sync(len) + this.request.query.test_sid_append
  }
}))

app.use(async function controllers (ctx) {
  switch (ctx.request.path) {
    case '/favicon.ico':
      ctx.status = 404
      break
    case '/wrongpath':
      ctx.body = !ctx.session ? 'no session' : 'has session'
      break
    case '/session/rewrite':
      ctx.session = { foo: 'bar' }
      ctx.body = ctx.session
      break
    case '/session/notuse':
      ctx.body = 'not touch session'
      break
    case '/session/get':
      get(ctx)
      break
    case '/session/get_error':
      getError(ctx)
      break
    case '/session/nothing':
      nothing(ctx)
      break
    case '/session/remove':
      remove(ctx)
      break
    case '/session/httponly':
      switchHttpOnly(ctx)
      break
    case '/session/id':
      getId(ctx)
      break
    case '/session/regenerate':
      await regenerate(ctx)
      break
    case '/session/regenerateWithData':
      ctx.session.foo = 'bar'
      await regenerate(ctx)
      ctx.body = { foo: ctx.session.foo, hasSession: ctx.session !== undefined }
      break
    default:
      other(ctx)
  }
})

function nothing (ctx) {
  ctx.body = ctx.session.count
}

function get (ctx) {
  ctx.session.count = ctx.session.count || 0
  ctx.session.count++
  ctx.body = String(ctx.session.count)
}

function getError (ctx) {
  ctx.session.count = ctx.session.count || 0
  ctx.session.count++
  throw new Error('oops')
}

function remove (ctx) {
  ctx.session = null
  ctx.body = '0'
}

function switchHttpOnly (ctx) {
  var httpOnly = ctx.session.cookie.httpOnly
  ctx.session.cookie.httpOnly = !httpOnly
  ctx.body = 'httpOnly: ' + !httpOnly
}

function other (ctx) {
  ctx.body = ctx.session !== undefined ? 'has session' : 'no session'
}

function getId (ctx) {
  ctx.body = ctx.sessionId
}

async function regenerate (ctx) {
  await ctx.regenerateSession()
  ctx.session.data = 'foo'
  getId(ctx)
}

const server = module.exports = http.createServer(app.callback())
server.store = store
