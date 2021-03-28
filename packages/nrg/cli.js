#!/usr/bin/env node

const path = require('path')
const cli = require('@generates/cli')
const { createLogger } = require('@generates/logger')
const cloneable = require('@ianwalter/cloneable')
const { excluding } = require('@generates/extractor')
const healthcheck = require('./lib/commands/healthcheck')
const copyMigrations = require('./lib/commands/copyMigrations')
const migrate = require('./lib/commands/migrate')
const newId = require('./lib/commands/newId')
const newMigration = require('./lib/commands/newMigration')
const newSeed = require('./lib/commands/newSeed')
const seed = require('./lib/commands/seed')
const run = require('./lib/commands/run')
const { get } = require('@generates/dotter')

const logger = createLogger({ level: 'info', namespace: 'nrg.cli' })

const input = cli({
  name: 'nrg',
  description: 'TODO',
  usage: 'nrg [commands] [options]',
  packageJson: true,
  commands: {
    copy: {
      commands: {
        migrations: {
          run: copyMigrations
        }
      }
    },
    new: {
      id: {
        run: newId
      },
      migration: {
        run: newMigration
      },
      seed: {
        run: newSeed
      }
    },
    migrate: {
      run: migrate
    },
    seed: {
      run: seed
    },
    run: {
      run
    },
    healthcheck: {
      run: healthcheck
    }
  },
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

//   } else if (commands[0] === 'healthcheck') {
//     await healthcheck(app, config)
//   } else if (commands[0] === 'print') {
//     if (commands[1] === 'config') {
//       let cfg = excluding(app.context.cfg, 'helpText')
//       if (!config.all) cfg = cloneable(cfg)
//       logger.info('Application config:', get(cfg, commands[2]))

if (input?.helpText) {
  process.stdout.write('\n')

  const [command] = input.args || []
  if (command) {
    logger.error(`Command "${command}" not found`)
    process.stdout.write('\n')
  }

  logger.info(input.helpText)
  process.stdout.write('\n')

  if (command) process.exit(1)
}

if (input?.catch) {
  input.catch(err => {
    logger.fatal(err)
    process.exit(1)
  })
}
