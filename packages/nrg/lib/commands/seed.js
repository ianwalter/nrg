const getApp = require('../utilities/getApp.js')

module.exports = async function seed (input) {
  const app = await getApp(input)

  // Seed database.
  await app.db.seed.run({
    loadExtensions: ['.js', '.mjs']
  })

  // Close any connections opened when the app was created.
  if (app.close) app.close()
}
