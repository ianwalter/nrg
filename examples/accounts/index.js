const path = require('path')
const { createApp, login, forgotPassword } = require('../..')

const app = createApp({
  log: { level: 'warn' },
  db: {
    connection: {
      host: process.env.DB_HOST,
      database: 'nrg',
      user: 'nrg',
      password: 'gottaLottaEnemies'
    },
    migrations: path.join(__dirname, 'migrations'),
    seeds: path.join(__dirname, 'seeds')
  },
  redis: {
    connection: {
      host: process.env.REDIS_HOST
    }
  },
  sessions: {
    keys: ['terra', 'incognita']
  },
  email: {
    transport: {
      host: process.env.SMTP_HOST,
      port: 1025
    }
  },
  accounts: { enabled: true }
})

// Allow users to login.
app.post('/login', ...login)

// Allow users to begin the password reset process.
app.post('/forgot-password', ...forgotPassword)

module.exports = app
