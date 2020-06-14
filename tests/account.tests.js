const { test } = require('@ianwalter/bff')
const { getTestEmail, extractEmailToken, Account } = require('..')
const app = require('../examples/accounts')
const { accounts, password } = require('../seeds/01_accounts')

const generalUser = accounts.find(a => a.firstName === 'General')
const updateUser = accounts.find(a => a.firstName === 'Account Update')
const changePasswordUser = accounts.find(a => a.firstName === 'Change Password')
const readOnlyUser = accounts.find(a => a.firstName === 'Read Only')
const changeEmailUser = accounts.find(a => a.firstName === 'Change Email')

test('Account -> Get', async t => {
  // Login.
  const credentials = { ...generalUser, password }
  const loginResponse = await app.test('/login').post(credentials)

  // Request account data.
  const accountResponse = await app.test('/account', loginResponse).get()

  // Verify the data is the same as the data received after login.
  t.expect(accountResponse.body).toEqual(loginResponse.body)
  t.expect(accountResponse.body).toMatchSnapshot()
})

test('Account -> Update', async t => {
  // Login.
  let response = await app.test('/login').post({ ...updateUser, password })
  t.expect(response.status).toBe(201)

  // Make a single property update.
  response = await app.test('/account', response).put({ firstName: 'Dadu' })
  t.expect(response.status).toBe(200)

  // Verify the property was updated.
  response = await app.test('/account', response).get()
  t.expect(response.body.firstName).toBe('Dadu')

  // Make an update to multiple properties.
  const updates = { firstName: 'Babu', lastName: 'Frik' }
  response = await app.test('/account', response).put(updates)

  // Verify the properties were updated.
  response = await app.test('/account', response).get()
  t.expect(response.body.firstName).toBe(updates.firstName)
  t.expect(response.body.lastName).toBe(updates.lastName)

  // Update everything.
  const julian = {
    firstName: 'Julian',
    lastName: 'Grimes',
    email: 'jgrimes@exampe.com',
    password,
    newPassword: 'nlrls03qkowmmfsfop3'
  }
  response = await app.test('/account', response).put(julian)
  t.expect(response.status).toBe(200)

  // Verify that email has stayed the same.
  response = await app.test('/account', response).get()
  t.expect(response.body.email).toBe(updateUser.email)

  // Logout.
  response = await app.test('/logout', response).delete()
  t.expect(response.status).toBe(200)
  const { csrfToken } = response.body

  // Verify the user can login with the new password.
  response.request.header['csrf-token'] = csrfToken
  const credentials = { ...updateUser, password: julian.newPassword }
  response = await app.test('/login', response).post(credentials)
  t.expect(response.status).toBe(201)
})

test('Account -> Update password', async t => {
  // Login.
  let payload = { ...changePasswordUser, password }
  let response = await app.test('/login').post(payload)
  t.expect(response.status).toBe(201)

  // Updating to a weak password.
  payload = { password, newPassword: 'Dadu' }
  response = await app.test('/account', response).put(payload)
  t.expect(response.status).toBe(400)
  t.expect(response.body).toMatchSnapshot()

  // Updating to a strong password but with an incorrect current password.
  const newPassword = 'egroaslk235opieflmkdqwp'
  payload = { password: 'aknasioeg7613bjhfwe', newPassword }
  response = await app.test('/account', response).put(payload)
  t.expect(response.status).toBe(400)
  t.expect(response.body).toMatchSnapshot()

  // Updating to a strong password.
  response = await app.test('/account', response).put({ password, newPassword })
  t.expect(response.status).toBe(200)
  t.expect(response.body).toMatchSnapshot()
})

test('Account -> Update read-only data', async t => {
  // Login.
  let response = await app.test('/login').post({ ...readOnlyUser, password })
  const accountData = response.body
  t.expect(response.status).toBe(201)

  // Attempt to update emailVerified.
  response = await app.test('/account', response).put({ emailVerified: false })
  t.expect(response.status).toBe(200)

  // Verify that the value hasn't changed in the database.
  const record = await Account.query().findById(readOnlyUser.id)
  t.expect(response.body).toEqual(accountData)
  t.expect(record).toMatchSnapshot({
    createdAt: t.expect.any(Date),
    updatedAt: t.expect.any(Date),
    password: t.expect.any(String)
  })

  // Attempt to update other read-only properties.
  const data = { createdAt: new Date(), updatedAt: new Date(), enabled: false }
  response = await app.test('/account', response).put(data)
  t.expect(response.status).toBe(200)

  // Verify that none of the values have changed in the database.
  t.expect(response.body).toEqual(accountData)
  const updated = await Account.query().findById(readOnlyUser.id)
  t.expect(record).toEqual(updated)
})

test('Account -> Update email address', async t => {
  // Login.
  let response = await app.test('/login').post({ ...changeEmailUser, password })
  t.expect(response.status).toBe(201)
  let accountData = response.body

  // Attempt to update email to an invalid email address.
  let email = 'changed_email_test@example'
  response = await app.test('/account', response).put({ email })
  t.expect(response.status).toBe(400)
  t.expect(response.body).toMatchSnapshot()

  // Attempt to update just the account's email address.
  email += '.com'
  response = await app.test('/account', response).put({ email })
  t.expect(response.status).toBe(200)

  // Verify that account data hasn't changed in the response or the database.
  t.expect(response.body).toEqual(accountData)

  // Verify that the email verification email was received.
  const byEmail = e => e.headers.to === email
  await t.asleep(500)
  t.expect(await getTestEmail(byEmail)).toBeDefined()

  // Attempt to update multiple account properties as well as the email address.
  const data = { firstName: 'Changed Email', lastName: 'Testini' }
  response = await app.test('/account', response).put({ email, ...data })
  t.expect(response.status).toBe(200)

  // Verify that the account data except for the email address has been updated
  // in the response body and database.
  t.expect(response.body).toEqual({ ...accountData, ...data })

  // Verify the new email address.
  await t.asleep(500)
  const { token } = await extractEmailToken(byEmail)
  response = await app.test('/verify-email').post({ email, token })
  t.print.log(response.body, email, token)
  t.expect(response.status).toBe(201)
  accountData = response.body

  // Log out.
  response = await app.test('/logout', response).delete()
  t.expect(response.status).toBe(200)

  // Verify that the user can login with the new email address.
  response = await app.test('/login').post({ email, password })
  t.expect(response.status).toBe(201)
  t.expect(response.body).toEqual(accountData)
  t.expect(response.body).toMatchSnapshot()
})
