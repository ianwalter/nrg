import amqp from 'amqp-connection-manager'
import { createLogger } from '@generates/logger'

const ns = 'nrg.mq'
const level = 'info'

export default function mq ({ app, ...config }) {
  const logger = app?.logger?.ns(ns) || createLogger({ level, namespace: ns })

  // Publish the message to the queue or exchange.
  function pub ({ exchange = '', queue }, content, options) {
    logger.debug('Publish', { queue, content, options })
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
      const ctx = { ...app?.context }
      ctx.ack = () => channelWrapper.ack(rawMessage)
      ctx.nack = () => channelWrapper.nack(rawMessage)
      try {
        const message = { ...rawMessage }
        message.content = JSON.parse(rawMessage.content.toString())
        return fn({ ...ctx, message })
      } catch (err) {
        logger.error(err)
        ctx.nack()
      }
    }
  }

  // Connect to and set up the message queue / subscriptions.
  const connection = amqp.connect(config.urls, config.options)
  const channelWrapper = connection.createChannel({
    json: true,
    async setup (channel) {
      await Promise.all(Object.values(queues).map(async queue => {
        // This needs to be done for some reason.
        await channel.assertQueue(queue.name)

        // Add a method to easily subscribe to the queue.
        queue.sub = async function queueSub (fn) {
          await channel.consume(queue.name, sub(fn), queue.options)
        }

        // If subscription handlers were specified in the config, subscribe them
        // to the queue immediately.
        if (queue.subscriptions) {
          await Promise.all(queue.subscriptions.map(queue.sub))
          delete queue.subscriptions
        }
      }))
    }
  })

  // Reduce the queues to standard queue objects.
  const toQueueMap = (acc, queue) => {
    queue = typeof queue === 'string' ? { name: queue } : queue
    acc[queue.name] = {
      ...queue,
      pub: (content, options) => pub({ queue: queue.name }, content, options),
      ready: new Promise(resolve => channelWrapper.once('connect', () => {
        logger.debug('Queue ready', queue.name)
        resolve()
      }))
    }
    return acc
  }
  const queues = config.queues.reduce(toQueueMap, {})

  return { connection, channel: channelWrapper, pub, sub, ...queues }
}
