const { test } = require('@ianwalter/bff')
const app = require('../examples/accounts')
const { accounts } = require('../examples/accounts/seeds/01_accounts')
const { token } = require('../examples/accounts/seeds/02_tokens')

const unverifiedUser = accounts.find(a => a.firstName === 'Unverified User')

test('Email Verification success', async ({ expect }) => {
  const payload = { email: unverifiedUser.email, token }
  const response = await app.test('/verify-email').post(payload)
  expect(response.status).toBe(201)
  expect(response.body).toMatchSnapshot()
})

test.skip('Email Verification from email', async ({ expect }) => {
})

test.skip('Email Verification from resent email', async ({ expect }) => {
})
