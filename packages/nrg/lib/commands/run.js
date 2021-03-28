const path = require('path')
const getApp = require('../utilities/getApp.js')
const { createLogger } = require('@generates/logger')

const logger = createLogger({ level: 'info', namespace: 'nrg.cli' })

module.exports = async function Run (input) {
  const [given] = input.args

  logger.debug('Run', input)

  if (given) {
    const file = path.resolve(`scripts/${given}`)

    logger.debug('Run script:', file)

    const app = await getApp(input)
    const script = require(file)
    await script(input, app)

    // Close any connections opened when the app was created.
    if (app.close) app.close()
  } else {
    throw new Error('No script specified')
  }
}
