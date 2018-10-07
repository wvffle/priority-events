const { expect } = require('chai')
const EventEmitter = require('..')
const PriorityQueue = require('fastpriorityqueue')

describe('EventEmitter', () => {
  it ('should have exports', () => {
    expect(EventEmitter).to.exist
    expect(EventEmitter).to.be.a('function')
  })

  describe('._sort()', () => {
    it('should choose higher priority entry', () => {
      const ee = new EventEmitter()

      const entry1 = { priority: 1 }
      const entry2 = { priority: 6 }

      expect(ee._sort(entry1, entry2)).to.be.false
      expect(ee._sort(entry2, entry1)).to.be.true
    })
  })

  describe('._getListenersQueue()', () => {
    it('should return priority queue', () => {
      const ee = new EventEmitter()

      const queue = ee._getListenersQueue('event')
      expect(queue).to.be.instanceof(PriorityQueue)
    })
  })

  describe('._addListenerEntry()', () => {
    it('should add custom entry to the listeners', () => {
      const ee = new EventEmitter()

      const entry = {
        listener () {},
        priority: 0,
        custom: 1,
      }

      ee._addListenerEntry('event', entry)

      const queue = ee._getListenersQueue('event')
      expect(queue.array).to.include(entry)
    })

    it('should throw an error about priority', () => {
      const ee = new EventEmitter()

      const entry = {
        listener () {},
      }

      const queue = ee._getListenersQueue('event')
      expect(() => {
        ee._addListenerEntry('event', entry)
      }).to.throw(/priority/)
    })

    it('should throw an error about listener', () => {
      const ee = new EventEmitter()

      const entry = {
        priority: 1,
      }

      const queue = ee._getListenersQueue('event')
      expect(() => {
        ee._addListenerEntry('event', entry)
      }).to.throw(/listener/)
    })
  })

  describe('._checkMaxListeners()', () => {
    it('should warn about max listeners limit', () => {
      const ee = new EventEmitter()

      for (let i = 0; i < 11; ++i) {
        ee._addListenerEntry('event', { listener () {}, priority: 1 })
      }

      const check = ee._checkMaxListeners('event')
      expect(check).to.be.false
    })

    it('should stop warning after listeners are removed', () => {
      const ee = new EventEmitter()

      for (let i = 0; i < 11; ++i) {
        ee._addListenerEntry('event', { listener () {}, priority: 1 })
      }

      const check1 = ee._checkMaxListeners('event')
      expect(check1).to.be.false

      ee._listeners.get('event').poll()

      const check2 = ee._checkMaxListeners('event')
      expect(check2).to.be.true
    })
  })

  describe('.addListener()', () => {
    it('should equal .on()', () => {
      const ee = new EventEmitter()
      expect(ee.on).to.equal(ee.addListener)
    })
  })

  describe('.prependListener()', () => {
    it('should equal .on()', () => {
      const ee = new EventEmitter()
      expect(ee.on).to.equal(ee.prependListener)
    })
  })

  describe('.on()', () => {
    it('should add listener', () => {
      const ee = new EventEmitter()

      ee.on('event', function () {})

      const queue = ee._getListenersQueue('event')
      expect(queue.size).to.be.equal(1)
    })

    it('should add listener with priority', () => {
      const ee = new EventEmitter()


      ee.on('event', function () {}, 1)
      ee.on('event', function () {}, 2)

      const queue = ee._getListenersQueue('event')
      expect(queue.size).to.be.equal(2)
    })

    it('should call twice', () => {
      const ee = new EventEmitter()

      let counter = 0
      ee.on('event', () => counter += 1)

      ee.emit('event')
      ee.emit('event')

      expect(counter).to.be.equal(2)
    })
  })

  describe('.prependOnceListener()', () => {
    it('should equal .once()', () => {
      const ee = new EventEmitter()
      expect(ee.once).to.equal(ee.prependOnceListener)
    })
  })

  describe('.once()', () => {
    it('should add listener', () => {
      const ee = new EventEmitter()

      ee.once('event', function () {})

      const queue = ee._getListenersQueue('event')
      expect(queue.size).to.be.equal(1)
    })

    it('should add listener with priority', () => {
      const ee = new EventEmitter()

      ee.once('event', function () {}, 1)
      ee.once('event', function () {}, 2)

      const queue = ee._getListenersQueue('event')
      expect(queue.size).to.be.equal(2)
    })

    it('should call only once', () => {
      const ee = new EventEmitter()

      let counter = 0
      ee.once('event', () => counter += 1)

      ee.emit('event')
      ee.emit('event')

      expect(counter).to.be.equal(1)
    })
  })

  describe('.off()', () => {
    it('should equal .removeListener()', () => {
      const ee = new EventEmitter()

      expect(ee.off).to.equal(ee.removeListener)
    })
  })

  describe('.removeListener()', () => {
    it('should remove listener', () => {
      const ee = new EventEmitter()

      const listener = function () {}
      ee.on('event', listener)
      ee.removeListener('event', listener)

      const queue = ee._getListenersQueue('event')
      expect(queue.size).to.be.equal(0)
    })

    it('should remove only one listener', () => {
      const ee = new EventEmitter()

      const listener = function () {}
      ee.on('event', listener)
      ee.on('event', listener)
      ee.removeListener('event', listener)

      const queue = ee._getListenersQueue('event')
      expect(queue.size).to.be.equal(1)
    })

    it('should throw error about listener type', () => {
      const ee = new EventEmitter()

      expect(() => {
        ee.removeListener('event', 1)
      }).to.throw(/listenerToRemove/)
    })
  })

  describe('.removeAllListeners()', () => {
    it('should remove all listeners', () => {
      const ee = new EventEmitter()

      ee.on('event1', () => {})
      ee.on('event1', () => {})

      ee.on('event2', () => {})
      ee.on('event2', () => {})

      ee.removeAllListeners()

      const queue1 = ee._getListenersQueue('event1')
      const queue2 = ee._getListenersQueue('event2')

      expect(queue1.size).to.be.equal(0)
      expect(queue2.size).to.be.equal(0)
    })

    it('should remove all listeners for event', () => {
      const ee = new EventEmitter()

      ee.on('event1', () => {})
      ee.on('event1', () => {})

      ee.on('event2', () => {})
      ee.on('event2', () => {})

      ee.removeAllListeners('event1')

      const queue1 = ee._getListenersQueue('event1')
      const queue2 = ee._getListenersQueue('event2')

      expect(queue1.size).to.be.equal(0)
      expect(queue2.size).to.be.equal(2)
    })
  })

  describe('.emit()', () => {
    it('should emit an event', next => {
      const ee = new EventEmitter()

      ee.on('event', () => {
        next()
      })

      ee.emit('event')
    })

    it('should trigger all listeners', next => {
      const ee = new EventEmitter()

      let count = 0
      const listener = () => {
        count += 1

        if (count === 2) next()
      }

      ee.on('event', listener)
      ee.on('event', listener)

      ee.emit('event')
    })

    it('should have "this" as event emitter', next => {
      const ee = new EventEmitter()

      ee.on('event', function () {
        expect(this).to.be.equal(ee)
        next()
      })

      ee.emit('event')
    })

    it('should pass data as arguments', next => {
      const ee = new EventEmitter()

      ee.on('event', (d1, d2) => {
        expect(d1).to.be.equal(1)
        expect(d2).to.be.equal(2)
        next()
      })

      ee.emit('event', 1, 2)
    })

    it('should trigger all listeners by priority', next => {
      const ee = new EventEmitter()

      let history = ''
      ee.on('event', () => {
        expect(history).to.be.equal('321')
        next()
      }, -Infinity)

      ee.on('event', () => {
        history += 2
      }, 2)

      ee.on('event', () => {
        history += 3
      }, 3)

      ee.on('event', () => {
        history += 1
      }, 1)

      ee.emit('event')
    })

    it('should stop execution of event queue', next => {
      const ee = new EventEmitter()

      let counter = 0
      const listener = () => {
        counter += 1
        return false
      }

      ee.on('event', listener)
      ee.on('event', listener)

      setTimeout(() => {
        expect(counter).to.be.equal(1)
        next()
      }, 1)

      ee.emit('event')
    })
  })

  describe('.eventNames()', () => {
    it('should return event names', () => {
      const ee = new EventEmitter()

      ee.on('event1', () => {})
      ee.on('event2', () => {})

      expect(ee.eventNames()).to.be.an('array')
      expect(ee.eventNames()).to.have.lengthOf(2)
      expect(ee.eventNames()).to.be.eql([ 'event1', 'event2' ])

    })

    it('should return empty array', () => {
      const ee = new EventEmitter()

      expect(ee.eventNames()).to.be.an('array')
      expect(ee.eventNames()).to.have.lengthOf(0)
    })
  })

  describe('.listenerCount', () => {
    it('should return actual listener count', () => {
      const ee = new EventEmitter()

      ee.on('event', function () {}, 1)
      ee.on('event', function () {}, 1)

      expect(ee.listenerCount('event')).to.be.equal(2)
    })

    it('should return 0', () => {
      const ee = new EventEmitter()
      expect(ee.listenerCount('event')).to.be.equal(0)
      expect(ee.listenerCount()).to.be.equal(0)
    })
  })

  describe('.listeners()', () => {
    it('should return event listeners', () => {
      const ee = new EventEmitter()

      const listener1 = () => {}
      const listener2 = () => {}

      ee.on('event', listener1)
      ee.on('event', listener2)

      expect(ee.listeners('event')).to.be.an('array')
      expect(ee.listeners('event')).to.have.lengthOf(2)
      expect(ee.listeners('event')).to.be.eql([ listener1, listener2 ])

    })

    it('should return empty array', () => {
      const ee = new EventEmitter()

      expect(ee.listeners('event')).to.be.an('array')
      expect(ee.listeners('event')).to.have.lengthOf(0)
    })
  })

  describe('.rawListeners()', next => {
    it('should return an array', () => {
      const ee = new EventEmitter()

      let count = 0
      const listener = () => count += 1
      const priority = 6

      ee.once('event', listener, priority)

      const raw = ee.rawListeners('event')
      expect(raw).to.be.an('array')
      expect(raw).to.have.lengthOf(1)

      expect(raw[0]).to.be.a('function')
      expect(raw[0].listener).to.be.equal(listener)
      expect(raw[0].priority).to.be.equal(priority)

      raw[0].listener()
      raw[0]()
      ee.emit('event')
      expect(count).to.be.equal(2)
    })

    it('should return an empty array', () => {
      const ee = new EventEmitter()

      expect(ee.rawListeners('event')).to.be.an('array')
      expect(ee.rawListeners('event')).to.have.lengthOf(0)
    })
  })

  describe('.setMaxListeners()', () => {
    it('should set max listener count', () => {
      const ee = new EventEmitter()

      ee.setMaxListeners(9)
      expect(ee._maxListeners).to.be.equal(9)
    })
  })

  describe('.getMaxListeners()', () => {
    it('should return max listener count', () => {
      const ee = new EventEmitter()

      ee.setMaxListeners(9)
      expect(ee.getMaxListeners()).to.be.equal(9)
    })
  })

  describe('#defaultMaxListeners', () => {
    it('should return default max listener count', () => {
      expect(EventEmitter.defaultMaxListeners).to.be.equal(10)
    })
  })
})
