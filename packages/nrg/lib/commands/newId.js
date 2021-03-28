const { createLogger, chalk } = require('@generates/logger')
const { nanoid } = require('nanoid')

const logger = createLogger({ level: 'info', namespace: 'nrg.cli' })

module.exports = function newId () {
  logger.log('🆔', chalk.white.bold('New ID:'))
  logger.log(nanoid())
}
