const path = require('path')
const nrg = require('../..')

const app = nrg.createApp({
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
      port: process.env.SMTP_PORT || 1025
    }
  },
  accounts: { enabled: true }
})

// Allow users to login.
app.post('/login', ...nrg.login)

// Allow users to begin the password reset process.
app.post('/forgot-password', ...nrg.forgotPassword)

// Allow users to reset their password.
app.post('/reset-password', ...nrg.passwordReset)

module.exports = app
