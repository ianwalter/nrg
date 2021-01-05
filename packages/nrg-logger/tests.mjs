import { test } from '@ianwalter/bff'
import execa from 'execa'
import stripAnsi from 'strip-ansi'

const outputs = [
  '💁',
  'Hello!',
  'data',
  '123',
  'GET /test Request',
  'Entered middleware!',
  'Testing, testing, 1, 2, 3..',
  "url: '/test'",
  'GET /test 204 Response',
  '✅',
  'Exiting...'
]

test('example', async t => {
  const { stdout } = await execa('node', ['example'])
  t.logger.info('Output:', `\n\n${stdout}\n\n`)
  for (const output of outputs) t.expect(stripAnsi(stdout)).toContain(output)
})
