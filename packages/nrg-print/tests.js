const { test } = require('@ianwalter/bff')
const execa = require('execa')

const outputs = [
  '💁',
  'Hello!',
  'data',
  '123',
  'GET /test Request',
  'Entered middleware!',
  'middleware.debug',
  'Testing, testing, 1, 2, 3..',
  "url: '/test'",
  'GET /test 204 Response',
  '✅',
  'Exiting...'
]

test('example', async t => {
  const { stdout } = await execa('node', ['example'])
  t.print.info('Output:', `\n\n${stdout}\n\n`)
  for (const output of outputs) t.expect(stdout).toContain(output)
})
