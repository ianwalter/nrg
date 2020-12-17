import { createLogger } from '@generates/logger'

const logger = createLogger({ level: 'info', namespace: 'nrg.session' })

class MemoryStore {
  constructor () {
    this.sessions = {}
  }

  get (sid) {
    logger.debug(`get value ${this.sessions[sid]} with key ${sid}`)
    return this.sessions[sid]
  }

  set (sid, val) {
    logger.debug(`set value ${val} for key ${sid}`)
    this.sessions[sid] = val
  }

  destroy (sid) {
    delete this.sessions[sid]
  }
}

module.exports = MemoryStore
