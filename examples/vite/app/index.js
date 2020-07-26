const { createApp } = require('@ianwalter/nrg')

const isProd = process.env.NODE_ENV === 'production'

const app = createApp({
  port: 3000,
  plugins: {
    ...!isProd ? { compress: false } : {}
  }
})

module.exports = app
