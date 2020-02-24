const { test } = require('@ianwalter/bff')
const app = require('./fixtures/base')
const nrg = require('..')

const result = { song: 'Wave' }
const addData = (ctx, next) => {
  ctx.result = result
  return next()
}
const end = ctx => (ctx.status = 200)

if (!process.env.GITHUB_ACTION) {
  test('addToSsr', async ({ expect }) => {
    const assertion = ctx => expect(ctx.state.ssr.song).toBe(result.song)
    app.get('/', addData, nrg.addToSsr, assertion, end)
    await app.test('/').get()
  })

  test('addToSsr with namespace', async ({ expect }) => {
    const assertion = c => expect(c.state.ssr.next.ok.song).toBe(result.song)
    app.get('/namespace', addData, nrg.addToSsr('next.ok'), assertion, end)
    await app.test('/namespace').get()
  })
}

test.only('SSR', async ({ expect }) => {
  const app = require('../examples/ssr')

  // Verify that the page is returned successfully when requesting the root
  // path.
  let response = await app.test('/').get()
  expect(response.status).toBe(200)
  expect(response.text).toMatchSnapshot()

  // Verify that a 404 Not Found is returned when requesting a path that
  // contains "not-found"
  response = await app.test('/not-found').get()
  expect(response.status).toBe(404)
})
