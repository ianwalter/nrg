#!/usr/bin/env node

const path = require('path')
const cli = require('@generates/cli')
const { createLogger } = require('@generates/logger')
const healthcheck = require('./lib/commands/healthcheck')
const copyMigrations = require('./lib/commands/copyMigrations')
const migrate = require('./lib/commands/migrate')
const newId = require('./lib/commands/newId')
const newMigration = require('./lib/commands/newMigration')
const newSeed = require('./lib/commands/newSeed')
const seed = require('./lib/commands/seed')
const run = require('./lib/commands/run')
const printConfig = require('./lib/commands/printConfig')

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
    health: {
      aliases: ['healthcheck'],
      run: healthcheck
    },
    print: {
      commands: {
        config: {
          run: printConfig
        }
      }
    }
  },
  options: {
    app: {
      alias: 'a',
      description: 'A file where your nrg app is created and exported.',
      default: 'app'
    },
    log: {
      default: { level: 'info' }
    }
  }
})

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
