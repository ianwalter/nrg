const cloneable = require('@ianwalter/cloneable')
const { excluding } = require('@generates/extractor')
const { get } = require('@generates/dotter')
const { createLogger } = require('@generates/logger')
const getApp = require('../utilities/getApp.js')

const logger = createLogger({ level: 'info', namespace: 'nrg.cli' })

module.exports = async function printConfig (input) {
  const app = await getApp(input)
  const [path] = input.args

  logger.debug('Config path:', path)

  let cfg = excluding(app.context.cfg, 'helpText')
  if (!input.all) cfg = cloneable(cfg)
  process.stdout.write('\n')
  logger.info('Application config:')
  logger.log(get(cfg, path))
  process.stdout.write('\n')

  // Close any connections opened when the app was created.
  if (app.close) app.close()
}
