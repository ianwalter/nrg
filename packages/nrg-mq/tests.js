const { test } = require('@ianwalter/bff')
const mq = require('.')

const mqHost = process.env.MQ_HOST || 'localhost'
const mqPort = process.env.MQ_PORT || '25672'
const urls = [`amqp://nrg:gottaLottaEnemies@${mqHost}:${mqPort}`]

test`publishing a message ${(t, done) => {
  const testMessage = { greeting: 'Hello World!' }

  const testMq = mq({
    logger: t.print,
    urls,
    queues: [
      {
        name: 'test',
        async sub (message) {
          t.expect(message.content).toEqual(testMessage)
          await message.ack()
          done()
        }
      }
    ]
  })

  setTimeout(() => testMq.test.pub(testMessage), 500)
}}`
