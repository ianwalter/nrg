#!/usr/bin/env node

import path from 'path'
import { createRequire } from 'module'
import cli from '@generates/cli'
import { createLogger } from '@generates/logger'
import cloneable from '@ianwalter/cloneable'
import { excluding } from '@ianwalter/extract'
import dot from '@ianwalter/dot'
import healthcheck from './lib/commands/healthcheck.js'
import { copyMigrations } from './lib/commands/migrations.js'
import newId from './lib/commands/newId.js'

const require = createRequire(import.meta.url)
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

const logger = createLogger({ namespace: 'nrg.cli' })

// Add the CLI onfig to the NRG_CLI environment variable so that nrg knows that
// it's running in a CLI context and it can merge the options with the
// app-supplied and default options.
process.env.NRG_CLI = JSON.stringify({ ...config, isCli: true })

async function run () {
  const { default: app } = await import(require.resolve(path.resolve(config.app)))

  if (config.help) {
    logger.info(config.helpText)
  } else if (commands[0] === 'copy') {
    if (commands[1] === 'migrations') {
      await copyMigrations({ commands }, app)
    } else {
      app.logger.fatal('Copy what? Available: migrations')
      process.exit(1)
    }
  } else if (commands[0] === 'migrate') {
    // Run migrations.
    await app.db.migrate.latest()
  } else if (commands[0] === 'new') {
    if (commands[1] === 'seed') {
      // Make a new seed.
      app.db.seed.make(commands[2])
    } else if (commands[1] === 'id') {
      newId({ logger })
    } else if (commands[1] === 'migration') {
      app.db.migrate.make(commands[2])
    } else {
      logger.fatal('New what? Available: secret, migration, seed')
      process.exit(1)
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
        logger.error(err)
        process.exit(1)
      }
    } else {
      // FIXME: add available scripts.
      logger.fatal('Run what?')
      process.exit(1)
    }
  } else if (commands[0] === 'healthcheck') {
    await healthcheck(app, config)
  } else if (commands[0] === 'print') {
    if (commands[1] === 'config') {
      let cfg = excluding(app.context.cfg, 'helpText')
      if (!config.all) cfg = cloneable(cfg)
      logger.info('Application config:', dot.get(cfg, commands[2]))
    } else {
      logger.fatal('Print what? Available: config')
      process.exit(1)
    }
  } else {
    logger.error('Unknown command:', commands[0], '\n\n')
    logger.info(config.helpText)
  }

  // Close any connections opened when the app was created.
  if (app.close) app.close()
}

run().catch(err => {
  logger.write('\n')
  logger.fatal(err)
  process.exit(1)
})
