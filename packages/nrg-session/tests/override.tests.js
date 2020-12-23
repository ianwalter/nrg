import { test } from '@ianwalter/bff'
import { app } from './support/override.js'

async function getCookie () {
  const response = await app.test('/session/update').get()
  return response.headers['set-cookie'].join(';')
}

test('Override • Save modified session', async t => {
  const headers = { cookie: await getCookie() }
  const response = await app.test('/session/update', { headers }).get()
  t.expect(response.body).toBe('2, null')
  t.expect(response.headers['set-cookie']).toBeDefined()
})

test('Override • Prevent saving modified session', async t => {
  const headers = { cookie: await getCookie() }
  const response = await app.test('/session/update/prevent', { headers }).get()
  t.expect(response.body).toBe('2, false')
  t.expect(response.headers['set-cookie']).not.toBeDefined()
})

test('Override • Force save unmodified session', async t => {
  const headers = { cookie: await getCookie() }
  const response = await app.test('/session/read/force', { headers }).get()
  t.expect(response.body).toBe('1, true')
  t.expect(response.headers['set-cookie']).toBeDefined()
})

test('Override • Prevent deleting session', async t => {
  const headers = { cookie: await getCookie() }
  let response = await app.test('/session/remove/prevent', { headers }).get()
  t.expect(response.body).toBe('0, false')
  t.expect(response.headers['set-cookie']).not.toBeDefined()

  response = await app.test('/session/read', { headers }).get()
  t.expect(response.body).toBe('1, null')
  t.expect(response.headers['set-cookie']).not.toBeDefined()
})

test('Override • Delete session on force save', async t => {
  const headers = { cookie: await getCookie() }
  let response = await app.test('/session/remove/force', { headers }).get()
  t.expect(response.body).toBe('0, true')
  t.expect(response.headers['set-cookie']).toBeDefined()

  response = await app.test('/session/read', { headers }).get()
  t.expect(response.body).toBe('0, null')
  t.expect(response.headers['set-cookie']).toBeDefined()
})
