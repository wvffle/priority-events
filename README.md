priority-events
---
Event emitter built on top of [fastpriorityqueue](https://www.npmjs.com/package/fastpriorityqueue)

```js
const EventEmitter = require('priority-events')

class Cat extends EventEmitter {
  meow (n) {
    this.emit('meow', `m${'e'.repeat(n)}ow`)
  }
}

const cat = new Cat()

cat.on('meow', msg => {
  console.log(msg)
}, 1)

cat.on('meow', msg => {
  console.log('Your cat meows!')
}, 666)

cat.meow(6)
// Your cat meows
// meeeeeeow
```

To explain it really simple: I had to have an prioritized event emitter so I wrote one myself. It tries to imitate node [events](https://nodejs.org/api/events.html) API as well as I could do it.


## Usage

### Listener registration
Everything is the same as in the node's [events](https://nodejs.org/api/events.html) module except for listener registration.

```js
ee.on(eventName, listener, priority)
```

By default `priority` is set to `1` but you can set it from `-Infinity` to `Infinity`

### Emitting events
When you call `ee.emit()` all listeners are called from the highest priority to the lowest one.

You can stop execution of the listeners by returning `false` in one of the listeners:

```js
let counter = 0

ee.on('event', () => {
  counter += 1
  return false
}, 2)

ee.on('event', () => {
  counter += 1
}, 1)

counter // 1
```
