const path = require('path')
const { promises: fs } = require('fs')
const { test } = require('@ianwalter/bff')
const app = require('.')

const gifPath = 'dist/static/img/boomer.gif'

test('serveStatic', async t => {
  const response = await app.test('/static/img/boomer.gif').get()
  t.expect(response.status).toBe(200)
  const gif = await fs.readFile(path.join(__dirname, gifPath))
  t.expect(response.body).toStrictEqual(gif)
})

test('Fallback for serveStatic', async t => {
  const response = await app.test('/static/some.js').get()
  t.expect(response.status).toBe(200)
  t.expect(response.text).toBe('I Wish I Could')
})
