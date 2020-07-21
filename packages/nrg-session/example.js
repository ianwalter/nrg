var session = require('./')
var Koa = require('koa')
var app = new Koa()

app.keys = ['some secret hurr']

app.use(session(app))

app.use(async function (ctx, next) {
  if (this.path === '/favicon.ico') return
  var n = this.session.views || 0
  this.session.views = ++n
  this.body = n + ' views'
})

app.listen(3000)
console.log('listening on port 3000')
