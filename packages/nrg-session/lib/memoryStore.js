import { createLogger } from '@generates/logger'

const logger = createLogger({ level: 'info', namespace: 'nrg.session' })

export default class MemoryStore {
  constructor () {
    this.sessions = {}
  }

  get (sid) {
    logger.debug(`Get value ${this.sessions[sid]} with key ${sid}`)
    return this.sessions[sid]
  }

  set (sid, val) {
    logger.debug(`Set value ${val} for key ${sid}`)
    this.sessions[sid] = val
  }

  destroy (sid) {
    delete this.sessions[sid]
  }
}
