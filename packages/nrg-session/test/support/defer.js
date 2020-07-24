const Koa = require('koa')
const http = require('http')
const session = require('../..')
const Store = require('./store')

const app = new Koa()

app.name = 'koa-session-test'
app.outputErrors = true
app.keys = ['keys', 'keykeys']
app.proxy = true // to support `X-Forwarded-*` header

app.use(async (ctx, next) => {
  try {
    await next()
  } catch (err) {
    ctx.status = err.status || 500
    ctx.body = err.message
  }
})

var store = new Store()
app.use(session({
  key: 'koss:test_sid',
  cookie: {
    maxAge: 86400,
    path: '/session'
  },
  defer: true,
  store: store,
  reconnectTimeout: 100
}))

// will ignore repeat session
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

// app.listen(7001)
var server = module.exports = http.createServer(app.callback())
server.store = store
