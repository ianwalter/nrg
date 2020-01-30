const { test } = require('@ianwalter/bff')
const app = require('./fixtures/base')
const nrg = require('..')

const result = { song: 'Wave' }
const addData = (ctx, next) => {
  ctx.result = result
  return next()
}

test('addToSsr', async ({ expect }) => {
  const assertion = ctx => expect(ctx.state.ssr.song).toBe(result.song)
  app.get('/', addData, nrg.addToSsr, assertion)
  await app.test('/').get()
})

test('addToSsr with namespace', async ({ expect }) => {
  const assertion = ctx => expect(ctx.state.ssr.next.ok.song).toBe(result.song)
  app.get('/namespace', addData, nrg.addToSsr('next.ok'), assertion)
  await app.test('/namespace').get()
})
