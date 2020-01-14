const { test } = require('@ianwalter/bff')
const app = require('../examples/accounts')

const firstName = 'Bilbo'
const lastName = 'Baggins'
const email = 'bilbo@example.com'
const password = '13eip3mlsdf0123mklqslk'

test('Registration required validation', async ({ expect }) => {
  // Email required.
  let payload = { firstName, lastName, password }
  let response = await app.test('/registration').post(payload)
  expect(response.status).toBe(400)
  expect(response.body).toMatchSnapshot()

  // Password required.
  payload = { firstName, lastName, email }
  response = await app.test('/registration').post(payload)
  expect(response.status).toBe(400)
  expect(response.body).toMatchSnapshot()

  // First name required.
  payload = { firstName: '', lastName, email, password }
  response = await app.test('/registration').post(payload)
  expect(response.status).toBe(400)
  expect(response.body).toMatchSnapshot()

  // Last name required.
  payload = { firstName, lastName: null, email, password }
  response = await app.test('/registration').post(payload)
  expect(response.status).toBe(400)
  expect(response.body).toMatchSnapshot()
})

test('Registration with weak password', async ({ expect }) => {
  const payload = { firstName, lastName, email, password: 'abc123' }
  const response = await app.test('/registration').post(payload)
  expect(response.status).toBe(400)
  expect(response.body).toMatchSnapshot()
})

test('Registration with invalid email', async ({ expect }) => {
  const payload = { firstName, lastName, email: 'bilbo@example,com', password }
  const response = await app.test('/registration').post(payload)
  expect(response.status).toBe(400)
  expect(response.body).toMatchSnapshot()
})

test('Registration with valid data', async ({ expect }) => {
  const payload = { firstName, lastName, email, password }
  const response = await app.test('/registration').post(payload)
  expect(response.status).toBe(200)
  expect(response.body).toMatchSnapshot()
})
