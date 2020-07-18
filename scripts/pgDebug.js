// A script to configure Postgres to log all statements since GitHub Actions
// doesn't support setting a command for service containers.
module.exports = async function pgDebug (app) {
  await app.db.raw("SELECT set_config('log_statement', 'all', false)")
}
