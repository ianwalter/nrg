import { Requester } from '@ianwalter/requester'
import { oneLine } from 'common-tags'
import createUrl from '@ianwalter/url'
import { createLogger } from '@generates/logger'
import getApp from '../utilities/getApp.js'

const requester = new Requester()
const logger = createLogger({ level: 'info', namespace: 'nrg.cli' })

export default async function healthcheck (input) {
  const app = await getApp(input)
  const { count = 3, timeout = 3000 } = input
  const { healthEndpoint, hostUrl } = app.context.cfg
  const { href } = createUrl(hostUrl, healthEndpoint)
  logger.info(`Running health check against ${href}`)

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
