const {
  validateRegistration,
  createAccount
} = require('./middleware/account')
const { hashPassword } = require('./middleware/password')
const {
  sendVerificationEmail
} = require('./middleware/email')

module.exports = {
  validateRegistration,
  hashPassword,
  createAccount,
  sendVerificationEmail,
  registration: [
    validateRegistration,
    hashPassword,
    createAccount,
    sendVerificationEmail
  ]
}
