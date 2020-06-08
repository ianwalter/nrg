const { requester } = require('@ianwalter/requester')
const { oneLine } = require('common-tags')

module.exports = function healthcheck (ctx, app) {
  const { count = 3, timeout = 3000 } = ctx.config
  const { health, baseUrl } = app.context.cfg
  const url = new URL(health.path, baseUrl).toString()
  ctx.print.info(`Running health check against ${url}`)

  return new Promise(resolve => {
    let interval = null
    let round = 1
    const check = async () => {
      ctx.print.log('⏱️', `Running health check ${round} of ${count}...`)
      try {
        await requester.get(url)
        clearInterval(interval)
        ctx.print.success('Health check succeeded!')
        resolve()
      } catch (err) {
        ctx.print.debug(err)
        if (round >= count) {
          clearInterval(interval)
          ctx.print.fatal(oneLine`
            Health check failed after ${count} checks in
            ${count * timeout / 1000} seconds!
          `)
          process.exit(1)
        }
      } finally {
        round++
      }
    }
    interval = setInterval(check, timeout)
  })
}
