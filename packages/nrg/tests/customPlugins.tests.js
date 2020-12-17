import { test } from '@ianwalter/bff'
import nrg from '../index.js'

test('Custom plugins', async t => {
  const defined = []
  function plugBeforeAssertion (app, ctx) {
    ctx.log.debug('Adding plugBeforeAssertion')
    defined.push(!!app.logger, !!app.close)
  }
  function plugAfterAssertion (app, ctx) {
    ctx.log.debug('Adding plugAfterAssertion')
    defined.push(!!app.logger, !!app.close)
  }
  const app = nrg.createApp({
    log: { level: 'debug' },
    plugins: {
      ...nrg.plugBefore('close', { plugBeforeAssertion }),
      ...nrg.plugAfter('close', { plugAfterAssertion })
    }
  })
  await app.test('/').get()
  t.expect(defined).toEqual([true, false, true, true])
})
