const { test } = require('@ianwalter/bff')
const app = require('./fixtures/base')
const nrg = require('..')

const result = { song: 'Wave' }
const addData = (ctx, next) => {
  ctx.result = result
  return next()
}

test.only('addToSsr', async ({ expect }, done) => {
  app.get('/', addData, nrg.addToSsr, (ctx, next) => {
    expect(ctx.state.ssr.song).toBe(result.song)
    done()
  })
  await app.test('/').get()
})

test('addToSsr with namespace', async ({ expect }, done) => {
  app.get('/namespace', addData, nrg.addToSsr('current'), (ctx, next) => {
    expect(ctx.state.ssr.current.song).toBe(result.song)
    done()
  })
  await app.test('/namespace').get()
})
