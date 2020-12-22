import path from 'path'
import { promises as fs } from 'fs'
import { test } from '@ianwalter/bff'
import { app } from './index.js'

const gifPath = 'dist/static/img/boomer.gif'

test('serveStatic', async t => {
  const response = await app.test('/static/img/boomer.gif').get()
  t.expect(response.statusCode).toBe(200)
  const gif = await fs.readFile(path.resolve(gifPath))
  t.expect(response.body).toStrictEqual(gif)
})

test('Fallback for serveStatic', async t => {
  const response = await app.test('/static/some.js').get()
  t.expect(response.statusCode).toBe(200)
  t.expect(response.body).toBe('I Wish I Could')
})
