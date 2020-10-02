const { test } = require('@ianwalter/bff')
const app = require('../app')
const { accounts, password } = require('../seeds/01_accounts')
const generalUser = accounts.find(a => a.firstName === 'General')

test('Session • Expiration', async t => {
  let response = await app.test('/login').post({ ...generalUser, password })
  t.expect(response.statusCode).toBe(201)

  // Sleep for 5 seconds so that the session expires.
  await t.asleep(5000)

  response = await app.test('/account', response).get()
  t.expect(response.statusCode).toBe(401)
})

test('Session • Rolling, rolling, rolling', async t => {
  let response = await app.test('/login').post({ ...generalUser, password })
  t.expect(response.statusCode).toBe(201)

  // Sleep for 4 seconds.
  await t.asleep(4000)

  response = await app.test('/account', response).get()
  t.expect(response.statusCode).toBe(200)

  // Sleep for 4 seconds.
  await t.asleep(4000)

  response = await app.test('/account', response).get()
  t.expect(response.statusCode).toBe(200)
})
