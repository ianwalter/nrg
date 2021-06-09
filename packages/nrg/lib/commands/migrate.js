const getApp = require('../utilities/getApp.js')

module.exports = async function migrate (input) {
  const app = await getApp(input)

  // Run migrations.
  await app.db.migrate.latest({
    loadExtensions: ['.js', '.mjs']
  })

  // Close any connections opened when the app was created.
  if (app.close) app.close()
}
