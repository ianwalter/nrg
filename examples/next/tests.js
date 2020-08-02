const { test } = require('@ianwalter/bff')
const app = require('./app')

test('api', async t => {
  const response = await app.test('/api/hello').get()
  t.expect(response.body).toEqual({ name: 'John Doe' })
})

test('example', async t => {
  const response = await app.test('/example').get()
  t.expect(response.body).toContain('I am from ctx.state!')
})
