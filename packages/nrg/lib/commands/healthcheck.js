import { requester } from '@ianwalter/requester'
import { oneLine } from 'common-tags'
import createUrl from '@ianwalter/url'

export default function healthcheck (app, config) {
  const { count = 3, timeout = 3000 } = config
  const { health, hostUrl } = app.context.cfg
  const { href } = createUrl(hostUrl, health.path)
  app.logger.info(`Running health check against ${href}`)

  return new Promise(resolve => {
    let interval = null
    let round = 1
    const check = async () => {
      app.logger.log('⏱️', `Running health check ${round} of ${count}...`)
      try {
        await requester.get(href)
        clearInterval(interval)
        app.logger.success('Health check succeeded!')
        resolve()
      } catch (err) {
        app.logger.debug(err)
        if (round >= count) {
          clearInterval(interval)
          app.logger.fatal(oneLine`
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
