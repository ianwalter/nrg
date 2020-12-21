import { EventEmitter } from 'events'
import { createLogger } from '@generates/logger'
import copy from 'copy-to'

const defaultOptions = { prefix: 'nrg:sess:' }

const logger = createLogger({ level: 'info', namespace: 'nrg.session' })

export default class Store extends EventEmitter {
  constructor (client, options) {
    super()
    this.client = client
    this.options = options
    copy(options).and(defaultOptions).to(this.options)

    // Delegate client connect / disconnect event
    if (typeof client.on === 'function') {
      client.on('disconnect', this.emit.bind(this, 'disconnect'))
      client.on('connect', this.emit.bind(this, 'connect'))
    }
  }

  async get (sid) {
    sid = this.options.prefix + sid
    logger.debug(`GET ${sid}`)
    const data = await this.client.get(sid)
    if (!data) {
      logger.debug('GET empty')
      return null
    }
    if (data && data.cookie && typeof data.cookie.expires === 'string') {
      // Make sure data.cookie.expires is a Date
      data.cookie.expires = new Date(data.cookie.expires)
    }
    logger.debug(`GOT ${sid}`, data)
    return data
  }

  async set (sid, sess) {
    let ttl = this.options.ttl
    if (!ttl) {
      const maxAge = sess.cookie && sess.cookie.maxAge
      if (typeof maxAge === 'number') ttl = maxAge

      // If has cookie.expires, ignore cookie.maxAge
      if (sess.cookie && sess.cookie.expires) {
        ttl = Math.ceil(sess.cookie.expires.getTime() - Date.now())
      }
    }

    sid = this.options.prefix + sid
    logger.debug(`SET ${sid}`, { sess, ttl })
    await this.client.set(sid, sess, ttl)
    logger.debug(`SET ${sid} complete`)
  }

  async destroy (sid) {
    sid = this.options.prefix + sid
    logger.debug(`DEL ${sid}`)
    await this.client.destroy(sid)
    logger.debug(`DEL ${sid} complete`)
  }
}
