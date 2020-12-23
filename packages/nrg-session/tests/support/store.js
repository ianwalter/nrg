import { EventEmitter } from 'events'

export default class Store extends EventEmitter {
  constructor (...args) {
    super(...args)
    this.sessions = {}
  }

  get (sid) {
    const session = this.sessions[sid]
    if (!session) return null

    const r = {}
    for (const key in session) r[key] = session[key]

    return r
  }

  set (sid, val) {
    this.sessions[sid] = val
  }

  destroy (sid) {
    delete this.sessions[sid]
  }
}
