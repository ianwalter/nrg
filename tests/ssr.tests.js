const { test } = require('@ianwalter/bff')
const app = require('./fixtures/base')
const nrg = require('..')

const result = { song: 'Wave' }
const addData = (ctx, next) => {
  ctx.result = result
  return next()
}

test('addToSsr', async ({ expect }) => {
  app.get('/', addData, nrg.addToSsr, (ctx, next) => {
    expect(ctx.state.ssr.song).toBe(result.song)
  })
  await app.test('/').get()
})

test('addToSsr with namespace', async ({ expect }) => {
  app.get('/namespace', addData, nrg.addToSsr('current'), (ctx, next) => {
    expect(ctx.state.ssr.current.song).toBe(result.song)
  })
  await app.test('/namespace').get()
})
