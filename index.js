const createApp = require('./lib/app')

const Base = require('./lib/models/Base')
const Account = require('./lib/models/Account')
const Token = require('./lib/models/Token')

const {
  GeneralError,
  HttpError,
  BadRequestError,
  UnauthorizedError,
  NotFoundError,
  ValidationError
} = require('./lib/errors')

const {
  logError,
  addErrorToResponse,
  handleError
} = require('./lib/middleware/error')

const { addToResponse, addToSsr } = require('./lib/middleware/result')

const { serveStatic, serveWebpack } = require('./lib/middleware/client')

const { serveSsr } = require('./lib/middleware/ssr')

const { generateToken, insertToken } = require('./lib/middleware/token')

const {
  validatePasswordStrength,
  hashPassword,
  comparePasswords
} = require('./lib/middleware/password')

const { requireAuthorization } = require('./lib/middleware/authorization')

const { sendEmail } = require('./lib/middleware/email')

const {
  validateRegistration,
  createAccount,
  generateEmailVerificationEmail
} = require('./lib/middleware/registration')

const {
  validateEmailVerification,
  getAccountWithEmailTokens,
  verifyEmail
} = require('./lib/middleware/emailVerification')

const {
  getAccount,
  validateAccountUpdate,
  validatePasswordChange,
  updateAccount
} = require('./lib/middleware/account')

const { validateLogin, authenticate } = require('./lib/middleware/login')

const {
  validateForgotPassword,
  generatePasswordResetEmail
} = require('./lib/middleware/forgotPassword')

const {
  validatePasswordReset,
  getAccountWithPasswordTokens,
  resetPassword
} = require('./lib/middleware/passwordReset')

module.exports = {
  /* Create Application: */

  createApp,

  /* Models: */

  Base,
  Account,
  Token,

  /* Error classes: */

  GeneralError,
  HttpError,
  BadRequestError,
  UnauthorizedError,
  NotFoundError,
  ValidationError,

  /* Middleware: */

  // Error:
  logError,
  addErrorToResponse,
  handleError,

  // Serving:
  serveStatic,
  serveWebpack,
  serveSsr,

  // Result:
  addToResponse,
  addToSsr,

  // Token:
  generateToken,
  insertToken,

  // Password:
  validatePasswordStrength,
  hashPassword,
  comparePasswords,

  // Authorization:
  requireAuthorization,

  // Email:
  sendEmail,

  // Registration:
  validateRegistration,
  createAccount,
  generateEmailVerificationEmail,
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
    updateAccount,
    authenticate,
    addToResponse
  ],

  // Account:
  getAccount,
  account: [
    requireAuthorization,
    getAccount,
    addToResponse
  ],

  // Login:
  validateLogin,
  authenticate,
  login: [
    validateLogin,
    getAccount,
    authenticate,
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

  // Password Reset:
  validatePasswordReset,
  getAccountWithPasswordTokens,
  resetPassword,
  passwordReset: [
    validatePasswordReset,
    getAccountWithPasswordTokens,
    resetPassword,
    hashPassword,
    updateAccount,
    authenticate,
    addToResponse
  ],

  // Account Update:
  validateAccountUpdate,
  validatePasswordChange,
  updateAccount,
  accountUpdate: [
    requireAuthorization,
    validateAccountUpdate,
    updateAccount,
    addToResponse
  ]
}
