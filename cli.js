#!/usr/bin/env node

const path = require('path')
const { promises: fs } = require('fs')
const cli = require('@ianwalter/cli')
const { Print } = require('@ianwalter/print')

const { _: commands, packageJson, ...config } = cli({
  name: 'nrg',
  usage: 'nrg [options] [command]',
  help: true,
  options: {
    app: {
      alias: 'a',
      description: 'A file where your nrg app is created and exported.',
      default: path.resolve('app')
    },
    log: {
      default: { level: 'info' }
    }
  }
})

// Create a Print instance for logging based on the given log level / config.
const print = new Print(config.log)

// Add the CLI onfig to the NRG_CLI environment variable so that nrg knows that
// it's running in a CLI context and it can merge the options with the
// app-supplied and default options.
process.env.NRG_CLI = JSON.stringify(config)

async function run () {
  const appPath = path.resolve(config.app)
  let app
  try {
    app = require(appPath)
  } catch (err) {
    print.fatal(err)
    process.exit(1)
  }

  if (config.help) {
    print.info(config.helpText)
  } else if (commands[0] === 'migration') {
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
  } else if (commands[0] === 'migrate') {
    // Run migrations.
    await app.db.migrate.latest()
    // } else if (true) {
  //   //
  } else if (commands[0] === 'new') {
    if (commands[1] === 'seed') {
      // Make a new seed.
      app.db.seed.make(commands[2])
    }
  } else if (commands[0] === 'seed') {
    // Run seeds.
    await app.db.seed.run()
  } else if (commands[0] === 'run') {
    if (commands[1]) {
      try {
        const script = require(path.resolve(`scripts/${commands[1]}`))
        await script(app)
      } catch (err) {
        print.error(err)
        process.exit(1)
      }
    } else {
      // TODO: add available scripts.
      app.logger.fatal('Run what?')
      process.exit(1)
    }
  } else {
    print.info(config.helpText)
  }

  // Close any open database connections.
  if (app.db) {
    app.db.destroy()
  }
}

run()
