const path = require('path')
const { createApp, login } = require('../..')

const app = createApp({
  log: { level: 'info' },
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
  sessions: { keys: ['terra', 'incognita'] },
  accounts: { enabled: true }
})

// Allow users to login.
app.post('/login', ...login)

module.exports = app
