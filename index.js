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
  authenticateLogin
} = require('./lib/middleware/session')

const { serveStatic, serveWebpack } = require('./lib/middleware/client')

const { serveSsr } = require('./lib/middleware/ssr')

module.exports = {
  // Create Application:
  createApp,

  /* Error classes: */

  GeneralError,
  HttpError,
  BadRequestError,
  UnauthorizedError,
  NotFoundError,
  ValidationError,

  /* Middleware: */

  // General:
  addToResponse,
  addToSsr,

  // Serving:
  serveStatic,
  serveWebpack,
  serveSsr,

  // Registration:
  validateRegistration,
  hashPassword,
  createAccount,
  generateToken,
  insertToken,
  generateEmailVerificationEmail,
  sendEmail,
  registration: [
    validateRegistration,
    hashPassword,
    createAccount,
    generateToken,
    insertToken,
    generateEmailVerificationEmail,
    sendEmail,
    addToResponse
  ],

  // Email Verification:
  validateEmailVerification,
  getAccountWithEmailTokens,
  verifyEmail,
  emailVerfication: [
    validateEmailVerification,
    getAccountWithEmailTokens,
    verifyEmail,
    addToResponse
  ],

  // Login:
  validateLogin,
  getAccount,
  authenticateLogin,
  login: [
    validateLogin,
    getAccount,
    authenticateLogin,
    addToResponse
  ],

  // Forgot Password:
  validateForgotPassword,
  generatePasswordResetEmail,
  forgotPassword: [
    validateForgotPassword,
    generateToken,
    insertToken,
    generatePasswordResetEmail,
    sendEmail,
    addToResponse
  ],

  // Reset Password:
  validatePasswordReset,
  getAccountWithPasswordTokens,
  passwordReset: [
    validatePasswordReset,
    getAccountWithPasswordTokens,
    resetPassword,
    addToResponse
  ],

  // Show Account:
  requireAuthorization,
  account: [
    requireAuthorization,
    getAccount,
    addToResponse
  ],

  // Account Update:
  requireAuthorization,
  validateAccountUpdate,
  validatePasswordChange,
  updateAccount,
  changePassword,
  accountUpdate: [
    requireAuthorization,
    validateAccountUpdate,
    updateAccount,
    addToResponse
  ]
}
