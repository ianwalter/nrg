const {
  validateRegistration,
  createAccount,
  getAccount
} = require('./middleware/account')
const { hashPassword } = require('./middleware/password')
const { generateToken, insertToken } = require('./middleware/token')
const {
  generateEmailVerificationEmail,
  generatePasswordResetEmail,
  sendEmail
} = require('./middleware/email')
const {
  validateLogin,
  authenticateLogin,
  handleAuthentication
} = require('./middleware/session')

module.exports = {
  validateRegistration,
  hashPassword,
  createAccount,
  generateEmailVerificationEmail,
  sendEmail,
  registration: [
    validateRegistration,
    hashPassword,
    createAccount,
    generateToken,
    insertToken,
    generateEmailVerificationEmail,
    sendEmail
  ],
  emailVerfication: [
    // validateEmailVerification,
    // getAccountWithEmailTokens
  ],
  validateLogin,
  getAccount,
  authenticateLogin,
  handleAuthentication,
  login: [
    validateLogin,
    getAccount,
    authenticateLogin,
    handleAuthentication
  ],
  generatePasswordResetEmail,
  passwordReset: [
    // validatePasswordReset,
    // getAccountWithPasswordTokens,
    generateToken,
    insertToken,
    generatePasswordResetEmail,
    sendEmail
  ]
}
