const {
  validateRegistration,
  createAccount
} = require('./middleware/account')
const { hashPassword } = require('./middleware/password')
const {
  generateEmailVerificationEmail,
  generatePasswordResetEmail,
  sendEmail
} = require('./middleware/email')

module.exports = {
  validateRegistration,
  hashPassword,
  createAccount,
  generateEmailVerificationEmail,
  generatePasswordResetEmail,
  sendEmail,
  registration: [
    validateRegistration,
    hashPassword,
    createAccount,
    generateEmailVerificationEmail,
    sendEmail
  ]
}
