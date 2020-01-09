const path = require('path')
const nrg = require('../..')

const app = nrg.createApp({
  baseUrl: 'http://localhost:9999/',
  log: { level: 'error' },
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

// Allow users to retrieve their account data.
app.get('/account', ...nrg.account)

// Allow users to update their account data.
app.put('/account', ...nrg.accountUpdate)

// Allow users to logout.
app.delete('/logout', ...nrg.logout)

// Allow users to start the password reset process.
app.post('/forgot-password', ...nrg.forgotPassword)

// Allow users to reset their password.
app.post('/reset-password', ...nrg.passwordReset)

module.exports = app
