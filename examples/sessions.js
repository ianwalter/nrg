const { createApp } = require('../')

const app = createApp({
  sessions: {
    keys: ['cba321'],
    redisUrl: 'redis://localhost:6379'
  }
})

app.use((ctx, next) => {
  if (ctx.path.indexOf('favicon') === -1) {
    ctx.session.views = (ctx.session.views || 0) + 1
    ctx.body = `View count: ${ctx.session.views}`
  } else {
    next()
  }
})

app.start()
