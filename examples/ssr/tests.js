const { test } = require('@ianwalter/bff')
const app = require('.')
const nrg = require('@ianwalter/nrg')

const result = { song: 'Wave' }
const addData = (ctx, next) => {
  ctx.state.body = result
  return next()
}
const end = ctx => (ctx.status = 200)

if (!process.env.GITHUB_ACTION) { // FIXME: why did I do this again?
  test('addToSsr', async t => {
    const assertion = ctx => t.expect(ctx.state.ssr.song).toBe(result.song)
    app.get('/', addData, nrg.addToSsr, assertion, end)
    await app.test('/').get()
  })

  test('addToSsr with namespace', async ({ expect }) => {
    const assertion = c => expect(c.state.ssr.next.ok.song).toBe(result.song)
    app.get('/namespace', addData, nrg.addToSsr('next.ok'), assertion, end)
    await app.test('/namespace').get()
  })
}

test('SSR', async t => {
  // Verify that the page is returned successfully when requesting the root
  // path.
  let response = await app.test('/').get()
  t.expect(response.statusCode).toBe(200)
  t.expect(response.body).toMatchSnapshot()

  // Verify that a 404 Not Found is returned when requesting a path that
  // contains "not-found"
  response = await app.test('/not-found').get()
  t.expect(response.statusCode).toBe(404)
})
