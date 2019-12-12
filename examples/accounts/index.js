const path = require('path')
const { createApp, login } = require('../..')

const app = createApp({
  log: {
    level: 'info',
    prettyPrint: { stream: false },
    prettifier: require('@ianwalter/pino-print')
  },
  db: {
    connection: {
      database: 'nrg',
      user: 'nrg',
      password: 'gottaLottaEnemies'
    },
    migrations: path.join(__dirname, 'migrations'),
    seeds: path.join(__dirname, 'seeds')
  },
  accounts: { enabled: true }
})

// Allow users to login.
app.post('/login', ...login)

module.exports = app
