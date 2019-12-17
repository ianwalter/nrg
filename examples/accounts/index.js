const path = require('path')
const { createApp, login } = require('../..')

const redisHost = process.env.REDIS_HOST || 'localhost'
const redisPort = process.env.REDIS_PORT || '6379'

console.log('REDIS', process.env.REDIS_PORT)

const app = createApp({
  log: { level: 'debug' },
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
  sessions: {
    redisUrl: `redis://${redisHost}:${redisPort}/0`,

    keys: ['terra', 'incognita']
  },
  accounts: { enabled: true }
})

// Allow users to login.
app.post('/login', ...login)

module.exports = app
