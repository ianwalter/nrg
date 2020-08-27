const amqp = require('amqp-connection-manager')
const clone = require('@ianwalter/clone')
const { createLogger } = require('@generates/logger')

const ns = 'nrg.mq'
const level = 'info'

module.exports = function mq ({ app, ...config }) {
  const logger = app?.logger?.ns(ns) || createLogger({ level, namespace: ns })

  // Publish the message to the queue or exchange.
  function pub ({ exchange = '', queue }, content, options) {
    logger.debug('Publish', { exchange, queue, content, options })
    return channelWrapper.publish(
      exchange,
      queue, // Or "routing key".
      content,
      options
    )
  }

  // A nicer API that uses JSON-compatible objects as messages instead of
  // Buffers.
  function sub (fn) {
    return rawMessage => {
      const ctx = app?.context ? clone(app.context) : {}
      ctx.ack = () => channelWrapper.ack(rawMessage)
      ctx.nack = () => channelWrapper.nack(rawMessage)
      const message = clone(rawMessage)
      message.content = JSON.parse(rawMessage.content.toString())
      return fn({ ...ctx, message })
    }
  }

  // Reduce the queues to standard queue objects.
  const toQueueMap = (acc, queue) => {
    queue = typeof queue === 'string' ? { name: queue } : queue
    acc[queue.name] = {
      ...queue,
      pub: (content, options) => pub({ queue: queue.name }, content, options),
      ready: () => new Promise(resolve => channelWrapper.on('connect', resolve))
    }
    return acc
  }
  const queues = config.queues.reduce(toQueueMap, {})

  // Connect to and set up the message queue / subscriptions.
  const connection = amqp.connect(config.urls, config.options)
  const channelWrapper = connection.createChannel({
    json: true,
    async setup (channel) {
      logger.debug('Channel setup')
      await Promise.all(Object.values(queues).map(async queue => {
        // This needs to be done for some reason.
        logger.debug('Assert queue', queue.name)
        await channel.assertQueue(queue.name)

        // Add a method to easily subscribe to the queue.
        queue.sub = async function queueSub (fn) {
          logger.debug('Subscription', queue.name)
          await channel.consume(queue.name, sub(fn), queue.options)
        }

        // If subscription handlers were specified in the config, subscribe them
        // to the queue immediately.
        if (queue.subcriptions) queue.subcriptions.map(queue.sub)
      }))
    }
  })

  return { connection, channel: channelWrapper, pub, sub, ...queues }
}
