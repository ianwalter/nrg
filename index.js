const createApp = require('./lib/app')
const {
  GeneralError,
  HttpError,
  BadRequestError,
  UnauthorizedError,
  NotFoundError,
  ValidationError
} = require('./lib/errors')
const {
  validateRegistration,
  createAccount,
  getAccount
} = require('./lib/middleware/account')
const { hashPassword } = require('./lib/middleware/password')
const { generateToken, insertToken } = require('./lib/middleware/token')
const {
  generateEmailVerificationEmail,
  generatePasswordResetEmail,
  sendEmail
} = require('./lib/middleware/email')
const {
  validateLogin,
  authenticateLogin,
  handleAuthentication
} = require('./lib/middleware/session')
const { serveStatic, serveWebpack } = require('./lib/middleware/client')

module.exports = {
  // Creates the application:
  createApp,
  // Error classes:
  GeneralError,
  HttpError,
  BadRequestError,
  UnauthorizedError,
  NotFoundError,
  ValidationError,
  // Middleware:
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
  ],
  serveStatic,
  serveWebpack
}
