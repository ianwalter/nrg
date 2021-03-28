const getApp = require('../utilities/getApp.js')

module.exports = async function newSeed (input) {
  const app = await getApp(input)

  // Create seed.
  await app.db.seed.make(input.args.length && input.args[0])

  // Close any connections opened when the app was created.
  if (app.close) app.close()
}
