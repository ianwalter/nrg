const path = require('path')
const { createLogger } = require('@generates/logger')

const logger = createLogger({ level: 'info', namespace: 'nrg.cli' })

module.exports = async function getApp (input) {
  const appPath = path.resolve(input.app)

  logger.debug('getApp', { input, appPath })

  // Add the CLI onfig to the NRG_CLI environment variable so that nrg knows
  // that it's running in a CLI context and it can merge the options with the
  // app-supplied and default options.
  process.env.NRG_CLI = JSON.stringify({ ...input, isCli: true })

  if (appPath.includes('.mjs') || input.packageJson.type === 'module') {
    const modulize = require('@generates/modulizer')
    const requireFromString = require('require-from-string')
    const cwd = path.dirname(appPath)
    const { cjs } = await modulize({ input: appPath, cjs: true, cwd })
    return requireFromString(cjs[1], appPath)
  }
  return require(appPath)
}
