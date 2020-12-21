import { test } from '@ianwalter/bff'
import { createApp, plugBefore, plugAfter } from '../index.js'

test('Custom plugins', async t => {
  const defined = []
  function plugBeforeAssertion (app, ctx) {
    ctx.logger.debug('Adding plugBeforeAssertion')
    defined.push(!!app.logger, !!app.close)
  }
  function plugAfterAssertion (app, ctx) {
    ctx.logger.debug('Adding plugAfterAssertion')
    defined.push(!!app.logger, !!app.close)
  }
  const app = await createApp({
    log: { level: 'debug' },
    plugins: {
      ...plugBefore('close', { plugBeforeAssertion }),
      ...plugAfter('close', { plugAfterAssertion })
    }
  })
  await app.test('/').get()
  t.expect(defined).toEqual([true, false, true, true])
})
