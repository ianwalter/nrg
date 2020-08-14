const amqp = require('amqp-connection-manager')
const clone = require('@ianwalter/clone')

module.exports = function mq (app, config) {
  const log = app?.logger?.ns('nrg.mq') || { debug: () => {} }

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
      return sub(app.context, message)
    }
  }

  // Connect to and set up the message queue / subscriptions.
  const connection = amqp.connect(config.urls, config.options)
  const channelWrapper = connection.createChannel({
    json: true,
    setup (channel) {
      log.debug('Channel setup')
      return Promise.all(Object.values(queues).map(async queue => {
        log.debug('Assert queue', queue.name)
        await channel.assertQueue(queue.name)
        if (queue.sub) {
          log.debug('Consume', queue.name)
          return channel.consume(queue.name, wrapSub(queue.sub), queue.options)
        }
      }))
    }
  })

  return { connection, channel: channelWrapper, pub, wrapSub, ...queues }
}
