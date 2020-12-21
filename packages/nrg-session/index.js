import { createLogger } from '@generates/logger'
import crc from 'crc'
import parse from 'parseurl'
import copy from 'copy-to'
import uid from 'uid-safe'
import { stripIndent } from 'common-tags'
import MemoryStore from './lib/memoryStore.js'
import Store from './lib/store.js'

const { crc32 } = crc
const logger = createLogger({ level: 'info', namespace: 'nrg.session' })

// Warning message for `MemoryStore` usage in production.
const warning = stripIndent`
  Warning: nrg-session's MemoryStore is not designed for a production
  environment, as it will leak memory, and will not scale past a single process.
`

const defaultCookie = {
  httpOnly: true,
  path: '/',
  overwrite: true,
  signed: true,
  maxAge: 24 * 60 * 60 * 1000 // One day in ms
}

/**
 * setup session store with the given `options`
 * @param {Object} options
 *   - [`key`] cookie name, defaulting to `koa.sid`
 *   - [`store`] session store instance, default to MemoryStore
 *   - [`ttl`] store ttl in `ms`, default to oneday
 *   - [`prefix`] session prefix for store, defaulting to `nrg:sess:`
 *   - [`cookie`] session cookie settings, defaulting to
 *     {path: '/', httpOnly: true, maxAge: null, overwrite: true, signed: true}
 *   - [`defer`] defer get session,
 *   - [`rolling`]  rolling session, always reset the cookie and sessions,
 *     default is false
 *     you should `await ctx.session` to get the session if defer is true,
 *     default is false
 *   - [`genSid`] you can use your own generator for sid
 *   - [`errorHandler`] handler for session store get or set error
 *   - [`valid`] valid(ctx, session), valid session value before use it
 *   - [`beforeSave`] beforeSave(ctx, session), hook before save session
 *   - [`sessionIdStore`] object with get, set, reset methods for passing
 *     session id throw requests.
 */

export default function nrgSession (options = {}) {
  const key = options.key || 'koa.sid'
  const client = options.store || new MemoryStore()
  const errorHandler = options.errorHandler || defaultErrorHanlder
  const reconnectTimeout = options.reconnectTimeout || 10000

  const store = new Store(client, {
    ttl: options.ttl,
    prefix: options.prefix
  })

  const genSid = options.genSid || uid.sync
  const valid = options.valid || noop
  const beforeSave = options.beforeSave || noop

  const cookie = options.cookie || {}
  copy(defaultCookie).to(cookie)

  let storeStatus = 'available'
  let waitStore = Promise.resolve()

  // Notify user that this store is not meant for a production environment.
  if (process.env.NODE_ENV === 'production' && client instanceof MemoryStore) {
    console.warn(warning)
  }

  const sessionIdStore = options.sessionIdStore || {
    get () {
      return this.cookies.get(key, cookie)
    },
    set (sid, session) {
      this.cookies.set(key, sid, session.cookie)
    },
    reset () {
      this.cookies.set(key, null)
    }
  }

  store.on('disconnect', () => {
    if (storeStatus !== 'available') return
    storeStatus = 'pending'
    waitStore = new Promise((resolve, reject) => {
      setTimeout(() => {
        if (storeStatus === 'pending') storeStatus = 'unavailable'
        reject(new Error('Session store is unavailable'))
      }, reconnectTimeout)
      store.once('connect', resolve)
    })
  })

  store.on('connect', () => {
    storeStatus = 'available'
    waitStore = Promise.resolve()
  })

  // Save empty session hash for compare
  const EMPTY_SESSION_HASH = hash(generateSession())

  return options.defer ? deferSession : session

  function addCommonAPI (ctx) {
    ctx._sessionSave = null

    // <ore flexible
    Object.defineProperty(ctx, 'sessionSave', {
      get: () => {
        return ctx._sessionSave
      },
      set: (save) => {
        ctx._sessionSave = save
      }
    })
  }

  /**
   * Generate a new session
   */
  function generateSession () {
    const session = {}

    // You can alter the cookie options in nexts
    session.cookie = {}
    for (const prop in cookie) session.cookie[prop] = cookie[prop]
    compatMaxage(session.cookie)
    return session
  }

  /**
   * Check URL matches cookie's path
   */
  function matchPath (ctx) {
    const pathname = parse(ctx).pathname
    const cookiePath = cookie.path || '/'
    if (cookiePath === '/') return true
    if (pathname.indexOf(cookiePath) !== 0) {
      logger.debug('Cookie path not match')
      return false
    }
    return true
  }

  /**
   * Get session from store
   *   get sessionId from cookie
   *   save sessionId into context
   *   get session from store
   */
  async function getSession (ctx) {
    if (!matchPath(ctx)) return
    if (storeStatus === 'pending') {
      logger.debug('Store is disconnected and pending')
      await waitStore
    } else if (storeStatus === 'unavailable') {
      logger.debug('Store is unavailable')
      throw new Error('Session store is unavailable')
    }

    if (!ctx.sessionId) ctx.sessionId = sessionIdStore.get.call(ctx)

    let session
    let isNew = false
    if (!ctx.sessionId) {
      logger.debug('Session ID does not exist')
      session = generateSession()
      ctx.sessionId = genSid.call(ctx, 24)
      isNew = true
    } else {
      try {
        session = await store.get(ctx.sessionId)
        logger.debug(`Get session ${session} with key ${ctx.sessionId}`)
      } catch (err) {
        logger.debug('Get session error: ', err)
        if (err.code !== 'ENOENT') errorHandler(err, 'get', ctx)
      }
    }

    // Make sure the session is still valid
    if (!session || !valid(ctx, session)) {
      logger.debug('Session is empty or invalid')
      session = generateSession()
      ctx.sessionId = genSid.call(ctx, 24)
      sessionIdStore.reset.call(ctx)
      isNew = true
    }

    // Get the originHash
    const originalHash = !isNew && hash(session)

    return {
      originalHash: originalHash,
      session: session,
      isNew: isNew
    }
  }

  /**
   * After everything done, refresh the session
   *   if session === null; delete it from store
   *   if session is modified, update cookie and store
   */
  async function refreshSession (ctx, session, originalHash, isNew) {
    // Reject any session changes, and do not update session expiry
    if (ctx._sessionSave === false) {
      return logger.debug('Session save disabled')
    }

    // Delete session
    if (!session) {
      if (!isNew) {
        logger.debug(`Session set to null, destroy session: ${ctx.sessionId}`)
        sessionIdStore.reset.call(ctx)
        return store.destroy(ctx.sessionId)
      }
      return logger.debug('A new session and set to null, ignore destroy')
    }

    // Force saving non-empty session
    if (ctx._sessionSave === true) {
      logger.debug('Session save forced')
      return saveNow(ctx, ctx.sessionId, session)
    }

    const newHash = hash(session)

    // If new session and not modified, just ignore
    if (!options.allowEmpty && isNew && newHash === EMPTY_SESSION_HASH) {
      return logger.debug('New session, not modified')
    }

    // Rolling session will always reset cookie and session
    if (!options.rolling && newHash === originalHash) {
      return logger.debug('Session not modified')
    }

    logger.debug('Session modified')

    await saveNow(ctx, ctx.sessionId, session)
  }

  async function saveNow (ctx, id, session) {
    compatMaxage(session.cookie)

    // Custom before save hook
    beforeSave(ctx, session)

    // Update session
    try {
      await store.set(id, session)
      sessionIdStore.set.call(ctx, id, session)
      logger.debug('Session saved')
    } catch (err) {
      logger.debug('Set session error', err)
      errorHandler(err, 'set', ctx)
    }
  }

  /**
   * Common session middleware
   * each request will generate a new session
   *
   * ```
   * let session = this.session
   * ```
   */
  async function session (ctx, next) {
    ctx.sessionStore = store
    if (ctx.session || ctx._session) return next()
    const result = await getSession(ctx)
    if (!result) return next()

    addCommonAPI(ctx)

    ctx._session = result.session

    // More flexible
    Object.defineProperty(ctx, 'session', {
      get () {
        return this._session
      },
      set (sess) {
        this._session = sess
      }
    })

    ctx.saveSession = async function saveSession () {
      const result = await getSession(ctx)
      if (!result) return next()
      return refreshSession(ctx, ctx.session, result.originalHash, result.isNew)
    }

    ctx.regenerateSession = async function regenerateSession () {
      logger.debug('Regenerating session')
      if (!result.isNew) {
        // Destroy the old session
        logger.debug('Destroying previous session')
        await store.destroy(ctx.sessionId)
      }

      ctx.session = generateSession()
      ctx.sessionId = genSid.call(ctx, 24)
      sessionIdStore.reset.call(ctx)

      logger.debug('Created new session:', ctx.sessionId)
      result.isNew = true
    }

    // Make sure `refreshSession` always called
    let firstError = null
    try {
      await next()
    } catch (err) {
      logger.debug('Next logic error', err)
      firstError = err
    }

    // Can't use finally because `refreshSession` is async
    try {
      await refreshSession(ctx, ctx.session, result.originalHash, result.isNew)
    } catch (err) {
      logger.debug('Refresh session error', err)
      if (firstError) ctx.app.emit('error', err, ctx)
      firstError = firstError || err
    }
    if (firstError) throw firstError
  }

  /**
   * Defer session middleware
   * only generate and get session when request use session
   *
   * ```
   * let session = yield this.session
   * ```
   */
  async function deferSession (ctx, next) {
    ctx.sessionStore = store

    // FIXME:
    // Accessing ctx.session when it's defined is causing problems
    // because it has side effect. So, here we use a flag to determine
    // that session property is already defined.
    if (ctx.__isSessionDefined) return next()
    let isNew = false
    let originalHash = null
    let touchSession = false
    let getter = false

    // If path not match
    if (!matchPath(ctx)) return next()

    addCommonAPI(ctx)

    Object.defineProperty(ctx, 'session', {
      async get () {
        if (touchSession) return this._session
        touchSession = true
        getter = true

        const result = await getSession(this)

        // If cookie path not match
        // this route's controller should never use session
        if (!result) return result

        originalHash = result.originalHash
        isNew = result.isNew
        this._session = result.session
        return this._session
      },
      set (value) {
        touchSession = true
        this._session = value
      }
    })

    // Internal flag to determine that session is already defined
    ctx.__isSessionDefined = true

    ctx.saveSession = async function saveSession () {
      // Make sure that the session has been loaded
      await ctx.session

      const result = await getSession(ctx)
      if (!result) return next()
      return refreshSession(ctx, ctx.session, result.originalHash, result.isNew)
    }

    ctx.regenerateSession = async function regenerateSession () {
      logger.debug('Regenerating session')
      // Make sure that the session has been loaded
      await ctx.session

      if (!isNew) {
        // Destroy the old session
        logger.debug('Destroying previous session')
        await store.destroy(ctx.sessionId)
      }

      ctx._session = generateSession()
      ctx.sessionId = genSid.call(ctx, 24)
      sessionIdStore.reset.call(ctx)
      logger.debug('Created new session:', ctx.sessionId)
      isNew = true
      return ctx._session
    }

    await next()

    if (touchSession) {
      // If only this.session=, need try to decode and get the sessionID
      if (!getter) ctx.sessionId = sessionIdStore.get.call(ctx)

      await refreshSession(ctx, ctx._session, originalHash, isNew)
    }
  }
}

/**
 * Get the hash of a session include cookie options.
 */
function hash (sess) {
  return crc32.signed(JSON.stringify(sess))
}

/**
 * Cookie use maxAge, hack to compat connect type `maxage`
 */
function compatMaxage (opts) {
  if (opts) {
    opts.maxAge = opts.maxage ? opts.maxage : opts.maxAge
    delete opts.maxage
  }
}

export { MemoryStore }

function defaultErrorHanlder (err, type) {
  err.name = 'koa-generic-session ' + type + ' error'
  throw err
}

function noop () {
  return true
}
