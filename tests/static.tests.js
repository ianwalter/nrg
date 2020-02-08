const path = require('path')
const { promises: fs } = require('fs')
const { test } = require('@ianwalter/bff')
const app = require('../examples/static')

const gifPath = '../examples/static/dist/static/img/boomer.gif'

test('serveStatic', async ({ expect }) => {
  const response = await app.test('/static/img/boomer.gif').get()
  expect(response.status).toBe(200)
  const gif = await fs.readFile(path.join(__dirname, gifPath))
  expect(response.body).toStrictEqual(gif)
})

test('Fallback for serveStatic', async ({ expect }) => {
  const response = await app.test('/static/some.js').get()
  expect(response.status).toBe(200)
  expect(response.text).toBe('I Wish I Could')
})
