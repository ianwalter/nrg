#!/usr/bin/env node

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

logger.debug('Running nrg CLI...')

const input = cli({
  name: 'nrg',
  description: 'TODO',
  usage: 'nrg [commands] [options]',
  packageJson: true,
  commands: {
    cp: {
      aliases: ['copy'],
      description: 'Copy files to your project',
      commands: {
        migrations: {
          usage: 'nrg cp migrations',
          run: copyMigrations
        }
      }
    },
    new: {
      description: 'Generate files in your project',
      commands: {
        id: {
          usage: 'nrg new id',
          description: 'Generate a new, unique ID and print it to the console',
          run: newId
        },
        migration: {
          usage: 'nrg new migration',
          description: 'Generate a new database migration file',
          run: newMigration
        },
        seed: {
          usage: 'nrg new seed',
          description: 'Generate a new database seed file',
          run: newSeed
        }
      }
    },
    migrate: {
      usage: 'nrg migrate',
      description: 'Run all database migrations',
      run: migrate
    },
    seed: {
      description: 'Seed the database with data',
      run: seed
    },
    run: {
      usage: 'nrg run [script]',
      description: 'Run a custom script',
      run
    },
    health: {
      aliases: ['healthcheck'],
      description: 'Perform a health check on your application',
      run: healthcheck
    },
    print: {
      description: 'Print something to the console',
      commands: {
        config: {
          usage: 'nrg print config [path]',
          description: `
            Print the application config (or a part of it at the given pat) to
            the console
          `,
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

logger.debug('input', input)

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
