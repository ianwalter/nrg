const amqp = require('amqp-connection-manager')
const clone = require('@ianwalter/clone')
const { createPrint } = require('@ianwalter/print')

module.exports = function mq (config) {
  const { logLevel = 'info' } = config
  const print = createPrint({ namespace: 'nrg.mq', level: logLevel })

  // Publish the message to the queue or exchange.
  function pub ({ exchange = '', queue }, content, options) {
    return channelWrapper.publish(
      exchange,
      queue, // Or "routing key".
      content,
      options
    )
  }

  // Reduce the queues to standard queue objects.
  const toQueueMap = (acc, queue) => {
    queue = typeof queue === 'string' ? { name: queue } : queue
    acc[queue.name] = {
      ...queue,
      pub: (content, options) => pub({ queue: queue.name }, content, options)
    }
    return acc
  }
  const queues = config.queues.reduce(toQueueMap, {})

  // A nicer API that uses JSON-compatible objects as messages instead of
  // Buffers.
  function wrapSub (sub) {
    return rawMessage => {
      const message = clone(rawMessage)
      message.ack = () => channelWrapper.ack(rawMessage)
      message.nack = () => channelWrapper.nack(rawMessage)
      message.content = JSON.parse(rawMessage.content.toString())
      return sub(message)
    }
  }

  // Connect to and set up the message queue / subscriptions.
  const connection = amqp.connect(config.urls, config.options)
  const channelWrapper = connection.createChannel({
    json: true,
    setup (channel) {
      print.debug('Channel setup')
      return Promise.all(Object.values(queues).map(async queue => {
        print.debug('Assert queue', queue.name)
        await channel.assertQueue(queue.name)
        if (queue.sub) {
          print.debug('Consume', queue.name)
          return channel.consume(queue.name, wrapSub(queue.sub), queue.options)
        }
      }))
    }
  })

  return { connection, channel: channelWrapper, pub, wrapSub, ...queues }
}
