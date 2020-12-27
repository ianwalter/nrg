const path = require('path')
const { createApp } = require('@ianwalter/nrg')

module.exports = createApp({
  static: {
    enabled: true, // Only necessary since NODE_ENV is not production.
    root: path.join(__dirname, 'dist'),
    fallback (ctx) {
      ctx.body = 'I Wish I Could'
    }
  }
})
