const path = require('path')
const { Print } = require('@ianwalter/print')
const { createApp } = require('../..')

module.exports = createApp({
  db: {
    connection: {
      host: '127.0.0.1',
      database: 'nrg',
      user: 'nrg',
      password: 'gottaLottaEnemies'
    },
    migrations: path.join(__dirname, 'migrations'),
    seeds: path.join(__dirname, 'seeds')
  },
  logger: new Print({ level: 'info' })
})
