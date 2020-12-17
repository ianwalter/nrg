import path from 'path'
import { promises as fs } from 'fs'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const migrationsSource = path.join(__dirname, '..', '..', 'migrations')

export async function copyMigrations ({ commands }, app) {
  // Determine the path for the resulting migrations directory.
  const destination = app.context.cfg.db.migrations ||
    commands[2] ||
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
}
