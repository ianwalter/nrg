#!/usr/bin/env node

const path = require('path')
const cli = require('@ianwalter/cli')

const { _: commands, ...config } = cli({
  name: 'nrg',
  app: {
    alias: 'a',
    description: 'A file where your nrg app is created and exported.'
  }
})

const app = require(path.resolve(config.app))

// if (true) {
//   // Make a new migration.
//   app.db.migrate.make()
// } else if (true) {
//   // Copy base account migrations.
// } else if (true) {
//   // Run migrations.
//   app.db.migrate.latest()
// } else if (true) {
//   //
// } else if (true) {
//   // Make a new seed.
//   app.db.seed.make()
// } else if (true) {
//   // Run seeds.
//   app.db.seed.run()
// }
