const { Model } = require('objection')

const createApp = require('./lib/createApp')

const Base = require('./lib/models/Base')
const Account = require('./lib/models/Account')
const Token = require('./lib/models/Token')
const Role = require('./lib/models/Role')

const {
  GeneralError,
  HttpError,
  BadRequestError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ValidationError
} = require('./lib/errors')

const {
  enrichAndLogError,
  addErrorToResponse,
  handleError
} = require('./lib/middleware/error')

const { addToResponse, addToSsr, redirect } = require('./lib/middleware/end')

const { serveStatic, serveWebpack } = require('./lib/middleware/client')

const { serveSsr } = require('./lib/middleware/ssr')

const {
  generateToken,
  insertToken,
  verifyToken
} = require('./lib/middleware/token')

const {
  validatePasswordStrength,
  hashPassword,
  comparePasswords
} = require('./lib/middleware/password')

const { requireAuthorization } = require('./lib/middleware/authorization')

const { validateEmail, sendEmail } = require('./lib/middleware/email')

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
  updatePassword,
  updateAccount
} = require('./lib/middleware/account')

const {
  checkSessionAuthentication,
  validateLogin,
  createUserSession,
  clearSession
} = require('./lib/middleware/session')

const {
  generatePasswordResetEmail
} = require('./lib/middleware/forgotPassword')

const {
  validatePasswordReset,
  getAccountWithPasswordTokens
} = require('./lib/middleware/passwordReset')

const { slowDown } = require('./lib/middleware/slowDown')

const { httpsRedirect } = require('./lib/middleware/httpsRedirect')

const { adaptNext } = require('./lib/middleware/next')

const swap = require('./lib/utilities/swap')
const getRandomTimeout = require('./lib/utilities/getRandomTimeout')
const getTestEmail = require('./lib/utilities/getTestEmail')
const extractEmailToken = require('./lib/utilities/extractEmailToken')
const getHostUrl = require('./lib/utilities/getHostUrl')

const serve = require('./lib/app/serve')

const config = require('./lib/config')

module.exports = {
  /**
   * Workloads:
   */

  createApp,

  /**
   * Middleware:
   */

  // Error:
  enrichAndLogError,
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
  verifyToken,

  // Password:
  validatePasswordStrength,
  hashPassword,
  comparePasswords,

  // Authorization:
  requireAuthorization,

  // Email:
  validateEmail,
  sendEmail,

  // Email Verification:
  generateEmailVerificationEmail,
  validateEmailVerification,
  getAccountWithEmailTokens,
  verifyEmail,
  emailVerification: [
    validateEmailVerification,
    getAccountWithEmailTokens,
    verifyToken,
    verifyEmail,
    createUserSession,
    reduceAccountForClient,
    addToResponse
  ],

  // Resend Email Verification:
  startEmailVerification,
  resendEmailVerification: [
    validateEmail,
    getAccount,
    ...startEmailVerification,
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
  createUserSession,
  login: [
    checkSessionAuthentication,
    validateLogin,
    getAccount,
    comparePasswords,
    createUserSession,
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
  generatePasswordResetEmail,
  forgotPassword: [
    validateEmail,
    generateToken,
    getAccount,
    insertToken,
    generatePasswordResetEmail,
    sendEmail,
    addToResponse
  ],

  // Password Reset:
  validatePasswordReset,
  getAccountWithPasswordTokens,
  updatePassword,
  passwordReset: [
    validatePasswordReset,
    getAccountWithPasswordTokens,
    verifyToken,
    verifyEmail,
    hashPassword,
    updatePassword,
    createUserSession,
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
    reduceAccountForClient,
    addToResponse
  ],

  // Slow down / rate limiting:
  slowDown,

  // HTTP to HTTPS redirect:
  httpsRedirect,

  // Adapt Next.js middleware to be executed with the nrg request context.
  adaptNext,

  /**
   * Error classes:
   */

  GeneralError,
  HttpError,
  BadRequestError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ValidationError,

  /**
   * Models:
   */

  Model,
  Base,
  Account,
  Token,
  Role,

  /**
   * Utilities:
   */

  swap,
  getRandomTimeout,
  getTestEmail,
  extractEmailToken,
  getHostUrl,

  /**
   * App methods:
   */
  serve,

  /**
   * Default config:
   */

  defaults: config()
}
