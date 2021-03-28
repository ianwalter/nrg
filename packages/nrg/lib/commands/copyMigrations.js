const path = require('path')
const { promises: fs } = require('fs')
const getApp = require('../utilities/getApp.js')

const migrationsSource = path.join(__dirname, '..', '..', 'migrations')

module.exports = async function copyMigrations (input) {
  const app = await getApp(input)

  // Determine the path for the resulting migrations directory.
  const destination = app.context.cfg.db.migrations ||
    (input.args.length && input.args[0]) ||
    path.resolve('migrations')

  // Create the migrations directory if it doesn't exist.
  await fs.mkdir(destination, { recursive: true })

  // Collect the migration files that need to be copied.
  const migrations = await fs.readdir(migrationsSource)

  // Asynchronously copy each file to the destination directory.
  await Promise.all(migrations.map(async migration => fs.copyFile(
    path.join(migrationsSource, migration),
    path.join(destination, migration)
  )))

  // Close any connections opened when the app was created.
  if (app.close) app.close()
}
