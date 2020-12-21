import { adaptNext } from '../middleware/next.js'

export function install (app, ctx) {
  if (ctx.logger) ctx.logger.debug('Adding Next.js middleware and method')

  app.use(adaptNext)

  app.next = async function next (req, res, next) {
    req.next = next
    await this.callback()(req, res)
    return res.next || res
  }
}
