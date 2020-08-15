module.exports = function ({ logger }) {
  const { nanoid } = require('nanoid')
  const { chalk } = require('@generates/logger')
  logger.log('🆔', chalk.white.bold('New ID:'))
  logger.log(nanoid())
}
