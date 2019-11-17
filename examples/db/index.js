const path = require('path')
const { createApp } = require('../..')

module.exports = createApp({
  db: {
    migrations: path.join(__dirname, 'migrations'),
    seeds: path.join(__dirname, 'seeds')
  }
})
