const PriorityQueue = require('fastpriorityqueue')

class EventEmitter {
  constructor () {
    this._maxListeners = EventEmitter.defaultMaxListeners
    this._listeners = new Map()
    this._warning = {}

    this.on = this.addListener
    this.prependListener = this.addListener
    this.prependOnceListener = this.once
    this.off = this.removeListener
  }

  _sort (a, b) {
    return a.priority > b.priority
  }

  _getListenersQueue (eventName) {
    let listeners = this._listeners.get(eventName)
    if (!listeners) {
       listeners = new PriorityQueue(this._sort)
       this._listeners.set(eventName, listeners)
    }

    return listeners
  }

  _saveListenerQueue (eventName, listeners) {
    this._listeners.set(eventName, listeners)
  }

  _addListenerEntry (eventName, entry) {
    if (typeof entry.priority !== 'number' || isNaN(entry.priority)) {
      throw new TypeError(`The "priority" field of "entry" argument must be of type Number and not be NaN. Received type ${typeof entry.priority}`)
    }

    if (typeof entry.listener !== 'function') {
      throw new TypeError(`The "listener" field of "entry" argument must be of type Function. Received type ${typeof entry.listener}`)
    }

    const listeners = this._getListenersQueue(eventName)
    listeners.add(entry)
    this._saveListenerQueue(eventName, listeners)
  }

  _checkMaxListeners (eventName) {
    const size = this._getListenersQueue(eventName).size

    if (size > this._maxListeners) {
      if (!this._warning[eventName]) {
        this._warning[eventName] = true
        process.stderr.write(`MaxListenersExceededWarning: Possible EventEmitter memory leak detected. ${this._maxListeners + 1} ${eventName} listeners added. Use emitter.setMaxListeners() to increase limit\n`)
      }

      return false
    } else {
      this._warning[eventName] = false
    }

    return true
  }

  addListener (eventName, listener, priority = 1) {
    this._checkMaxListeners(eventName)
    this._addListenerEntry(eventName, { listener, priority, once: false })

    this.emit('newListener', eventName, listener, priority)
    return this
  }

  removeListener (eventName, listenerToRemove) {
    if (typeof listenerToRemove !== 'function') {
      throw new TypeError(`The "listenerToRemove" argument must be of type Function. Received type ${typeof listenerToRemove}`)
    }

    const listeners = this._getListenersQueue(eventName)
    listeners.removeOne(entry => {
      const { listener, priority } = entry

      if (listener !== listenerToRemove) return false

      this.emit('removeListener', eventName, listener, priority)
      return true
    })

    return this
  }

  removeAllListeners (eventName) {
    if (eventName === undefined) {
      this._listeners = new Map()
      return this
    }

    if (!this._listeners.has(eventName)) return this
    this._listeners.set(eventName, new PriorityQueue(this._sort))
    return this
  }

  emit (eventName, ...args) {
    if (!this._listeners.has(eventName)) return false

    const originalListeners = this._getListenersQueue(eventName)
    if (!originalListeners.size) return false

    const listeners = originalListeners.clone()
    while(!listeners.isEmpty()) {
      const { listener, once } = listeners.poll()

      if (once) {
        const listenerToRemove = listener
        originalListeners.removeMany(entry => {
          const { listener, priority, once} = entry

          if (listener !== listenerToRemove || !once) return false

          this.emit('removeListener', eventName, listener, priority)
          return true
        })
      }

      const $continue = listener.apply(this, args)

      if ($continue || $continue === undefined) continue
      break
    }

    return true
  }

  eventNames () {
    return [...this._listeners.keys()]
  }

  listenerCount (eventName) {
    if (!eventName) return 0
    if (!this._listeners.has(eventName)) return 0
    return this._listeners.get(eventName).size
  }

  listeners (eventName) {
    if (this.listenerCount(eventName) === 0) return []
    return this._getListenersQueue(eventName).array.map(entry => entry.listener)
  }

  rawListeners (eventName) {
    if (this.listenerCount(eventName) === 0) return []
    return this._getListenersQueue(eventName).array.map(entry => {
      const fn = () => {
        if (entry.once) {
          this.removeListener(eventName, entry.listener)
        }

        entry.listener.apply(this, arguments)
      }

      fn.listener = entry.listener
      fn.priority = entry.priority

      return fn
    })
  }

  once (eventName, listener, priority = 1) {
    this._checkMaxListeners(eventName)
    this._addListenerEntry(eventName, { listener, priority, once: true })

    this.emit('newListener', eventName, listener, priority)
    return this
  }

  setMaxListeners (n) {
    if (n == 0) n = Infinity

    this._maxListeners = n
    return this
  }

  getMaxListeners () {
    return this._maxListeners
  }

  static get defaultMaxListeners () {
    return 10
  }
}

module.exports = EventEmitter
