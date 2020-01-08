const createApp = require('./lib/app')
const createWorker = require('./lib/worker')

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

const { addToResponse, addToSsr, redirect } = require('./lib/middleware/result')

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
  createAccount
} = require('./lib/middleware/registration')

const {
  generateEmailVerificationEmail,
  startEmailVerification,
  validateEmailVerification,
  getAccountWithEmailTokens,
  verifyEmail
} = require('./lib/middleware/emailVerification')

const {
  getAccount,
  reduceAccountForClient,
  validateAccountUpdate,
  validatePasswordUpdate,
  startEmailUpdate,
  updateAccount
} = require('./lib/middleware/account')

const {
  validateLogin,
  authenticate,
  clearSession
} = require('./lib/middleware/session')

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
  /**
   * Workloads:
   */

  createApp,
  createWorker,

  /**
   * Middleware:
   */

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
  redirect,

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

  // Email Verification:
  generateEmailVerificationEmail,
  startEmailVerification,
  validateEmailVerification,
  getAccountWithEmailTokens,
  verifyEmail,
  emailVerfication: [
    validateEmailVerification,
    getAccountWithEmailTokens,
    verifyEmail,
    updateAccount,
    authenticate,
    reduceAccountForClient,
    addToResponse
  ],

  // Registration:
  validateRegistration,
  createAccount,
  registration: [
    validateRegistration,
    hashPassword,
    createAccount,
    ...startEmailVerification,
    addToResponse
  ],

  // Account:
  getAccount,
  reduceAccountForClient,
  account: [
    requireAuthorization,
    getAccount,
    reduceAccountForClient,
    addToResponse
  ],

  // Login:
  validateLogin,
  authenticate,
  login: [
    validateLogin,
    getAccount,
    comparePasswords,
    authenticate,
    reduceAccountForClient,
    addToResponse
  ],

  // Logout:
  clearSession,
  logout: [
    clearSession,
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
    reduceAccountForClient,
    addToResponse
  ],

  // Account Update:
  validatePasswordUpdate,
  validateAccountUpdate,
  startEmailUpdate,
  updateAccount,
  accountUpdate: [
    requireAuthorization,
    validatePasswordUpdate,
    validateAccountUpdate,
    getAccount,
    comparePasswords,
    hashPassword,
    startEmailUpdate,
    updateAccount,
    addToResponse
  ],

  /**
   * Error classes:
   */

  GeneralError,
  HttpError,
  BadRequestError,
  UnauthorizedError,
  NotFoundError,
  ValidationError,

  /**
   * Models:
   */

  Base,
  Account,
  Token
}
