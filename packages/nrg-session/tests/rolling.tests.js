import { test } from '@ianwalter/bff'
import { app } from './support/rolling.js'

async function getCookie () {
  const response = await app.test('/session/get').get()
  return response.headers['set-cookie'].join(';')
}

test('Rolling • Get session', async t => {
  const headers = { cookie: await getCookie() }
  const response = await app.test('/session/get', { headers }).get()
  t.expect(response.body).toBe(2)
})

test('Rolling • Remove session', async t => {
  const headers = { cookie: await getCookie() }
  let response = await app.test('/session/remove', { headers }).get()

  response = await app.test('/session/get', { headers }).get()
  t.expect(response.body).toBe(1)
})

test('Rolling • GET /session/nothing existing session', async t => {
  const headers = { cookie: await getCookie() }
  const response = await app.test('/session/nothing', { headers }).get()
  t.expect(response.headers['set-cookie']).toBeDefined()
})

test('Rolling • GET /session/nothing new session', async t => {
  const response = await app.test('/session/nothing').get()
  t.expect(response.headers['set-cookie']).not.toBeDefined()
})
