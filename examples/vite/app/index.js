import { createApp } from '@ianwalter/nrg'

const isProd = process.env.NODE_ENV === 'production'

const app = createApp({
  port: 3000,
  plugins: {
    // Disable compression in dev since vite already has compression built-in.
    ...!isProd ? { compress: false } : {}
  }
})

module.exports = app
