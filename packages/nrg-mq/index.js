import amqp from 'amqp-connection-manager'
import { createLogger } from '@generates/logger'

const ns = 'nrg.mq'
const level = 'info'

export function install (app, ctx, cfg) {
  if (ctx.logger) ctx.logger.debug('Adding mq')

  const logger = app?.logger?.ns(ns) || createLogger({ level, namespace: ns })

  // Publish the message to the queue or exchange.
  function pub ({ exchange = '', queue }, content, options) {
    logger.debug('Publish', { queue, content, options })
    return channel.publish(
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
      ctx.ack = () => channel.ack(rawMessage)
      ctx.nack = () => channel.nack(rawMessage)
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
  const connection = amqp.connect(cfg.mq.urls, cfg.mq.options)
  const channel = connection.createChannel({
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
      ready: new Promise(resolve => channel.once('connect', () => {
        logger.debug('Queue ready', queue.name)
        resolve()
      }))
    }
    return acc
  }
  const queues = cfg.mq.queues.reduce(toQueueMap, {})

  //
  app.mq = app.context.mq = { connection, channel, pub, sub, ...queues }
}
