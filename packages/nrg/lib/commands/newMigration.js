const getApp = require('../utilities/getApp.js')

module.exports = async function newMigration (input) {
  const app = await getApp(input)

  // Create migration.
  await app.db.migrate.make(input.args.length && input.args[0])

  // Close any connections opened when the app was created.
  if (app.close) app.close()
}
