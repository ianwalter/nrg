#!/usr/bin/env node

const path = require('path')
const { promises: fs } = require('fs')
const cli = require('@ianwalter/cli')
const { print } = require('@ianwalter/print')

const { _: commands, ...config } = cli({
  name: 'nrg',
  app: {
    alias: 'a',
    description: 'A file where your nrg app is created and exported.',
    default: process.cwd()
  }
})

async function run () {
  const appPath = path.resolve(config.app)
  let app
  try {
    app = require(appPath)
  } catch (err) {
    // TODO: make error message more helpful.
    print.fatal('App not found at', appPath)
    process.exit(1)
  }

  if (commands[0] === 'migration') {
    // Make a new migration.
    app.db.migrate.make(commands[1])
  } else if (commands[0] === 'copy') {
    if (commands[1] === 'migrations') {
      // Copy base account migrations.
      const source = path.join(__dirname, 'migrations')
      const destination = app.context.options.db.migrations ||
        path.resolve('migrations')
      const migrations = await fs.readdir(source)
      await Promise.all(migrations.map(async migration => fs.copyFile(
        path.join(source, migration),
        path.join(destination, migration)
      )))
    } else {
      app.logger.fatal('Copy what? Available: migrations')
      process.exit(1)
    }
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
  }
}

run()
