import { promises as fs } from 'fs'
import { test } from '@ianwalter/bff'

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
  const output = await fs.readFile('./output.txt', 'utf8')
  t.logger.info('Output:', `\n\n${output}\n\n`)
  for (const output of outputs) t.expect(output).toContain(output)
})
