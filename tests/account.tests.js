const { test } = require('@ianwalter/bff')
const { excluding } = require('@ianwalter/extract')
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
  const response = await app.test('/login').post(credentials)

  // Request account data.
  const accountResponse = await app.test('/account', response).get()

  // Verify the data is the same as the data received after login and what's in
  // the database.
  const record = await Account.query().findById(generalUser.id)
  t.expect(accountResponse.body).toEqual(response.body)
  t.expect(accountResponse.body).toEqual(Account.extractClientData(record))
})

test('Account -> Update', async t => {
  // Login.
  let record = await Account.query().findById(updateUser.id)
  let response = await app.test('/login').post({ ...updateUser, password })
  t.expect(response.status).toBe(201)

  // Make a single property update.
  let updates = { firstName: 'Dadu' }
  response = await app.test('/account', response).put(updates)
  t.expect(response.status).toBe(200)

  // Verify the property was updated.
  let updated = await Account.query().findById(updateUser.id)
  response = await app.test('/account', response).get()
  t.expect(response.body).toEqual(Account.extractClientData(updated))
  t.expect(updated.firstName).toBe(updates.firstName)
  const previousUpdatedAt = record.updatedAt.getTime()
  t.expect(updated.updatedAt.getTime()).toBeGreaterThan(previousUpdatedAt)
  record = excluding(record, 'firstName', 'updatedAt')
  t.expect(excluding(updated, 'firstName', 'updatedAt')).toEqual(record)

  // Make an update to multiple properties.
  updates = { firstName: 'Babu', lastName: 'Frik' }
  response = await app.test('/account', response).put(updates)

  // Verify the properties were updated.
  updated = await Account.query().findById(updateUser.id)
  response = await app.test('/account', response).get()
  t.expect(response.body).toEqual(Account.extractClientData(updated))
  t.expect(response.body.firstName).toBe(updates.firstName)
  t.expect(response.body.lastName).toBe(updates.lastName)
  t.expect(response.body).toEqual(Account.extractClientData(updated))

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
  t.expect(response.status).toBe(201)

  // Attempt to update emailVerified.
  let record = await Account.query().findById(readOnlyUser.id)
  response = await app.test('/account', response).put({ emailVerified: false })
  t.expect(response.status).toBe(200)

  // Verify that the value hasn't changed in the database.
  let updated = await Account.query().findById(readOnlyUser.id)
  t.expect(updated).toEqual(record)
  record = updated

  // Attempt to update other read-only properties.
  const data = { createdAt: new Date(), updatedAt: new Date(), enabled: false }
  response = await app.test('/account', response).put(data)
  t.expect(response.status).toBe(200)

  // Verify that none of the values have changed in the database.
  updated = await Account.query().findById(readOnlyUser.id)
  t.expect(updated).toEqual(record)
})

test('Account -> Update email address', async t => {
  // Login.
  let response = await app.test('/login').post({ ...changeEmailUser, password })
  t.expect(response.status).toBe(201)

  // Attempt to update email to an invalid email address.
  let record = await Account.query().findById(changeEmailUser.id)
  let email = 'changed_email_test@example'
  response = await app.test('/account', response).put({ email })
  t.expect(response.status).toBe(400)
  let updated = await Account.query().findById(changeEmailUser.id)
  t.expect(updated).toEqual(record)
  record = updated

  // Attempt to update just the account's email address.
  email += '.com'
  response = await app.test('/account', response).put({ email })
  t.expect(response.status).toBe(200)

  // Verify that account data hasn't changed in the database.
  updated = await Account.query().findById(changeEmailUser.id)
  t.expect(updated).toEqual(record)

  // Verify that the email verification email was received.
  const byEmail = e => e.headers.to === email
  await t.asleep(500)
  t.expect(await getTestEmail(byEmail)).toBeDefined()

  // Attempt to update multiple account properties as well as the email address.
  const updates = { firstName: 'Changed Email', lastName: 'Testini' }
  response = await app.test('/account', response).put({ email, ...updates })
  t.expect(response.status).toBe(200)

  // Verify the new email address.
  await t.asleep(500)
  const { token } = await extractEmailToken(byEmail)
  response = await app.test('/verify-email').post({ email, token })
  t.expect(response.status).toBe(201)

  // Log out.
  response = await app.test('/logout', response).delete()
  t.expect(response.status).toBe(200)

  // Verify that the user can login with the new email address.
  response = await app.test('/login').post({ email, password })
  t.expect(response.status).toBe(201)
  t.expect(response.body.firstName).toEqual(updates.firstName)
  t.expect(response.body.lastName).toEqual(updates.lastName)
})
