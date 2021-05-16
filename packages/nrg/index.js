const { Model } = require('objection')

const createApp = require('./lib/createApp')

const Base = require('./lib/models/Base')
const Account = require('./lib/models/Account')
const Token = require('./lib/models/Token')
const Role = require('./lib/models/Role')
const AccountRole = require('./lib/models/AccountRole')

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
  handleError,
  testError
} = require('./lib/middleware/error')

const { addToResponse, redirect, noContent } = require('./lib/middleware/end')

const { serveStatic, logClientMessage } = require('./lib/middleware/client')

const {
  generateToken,
  insertToken,
  verifyToken
} = require('./lib/middleware/token')

const {
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
  getEmailTokens,
  verifyEmail
} = require('./lib/middleware/emailVerification')

const {
  getAccount,
  reduceAccountForClient,
  validateAccountUpdate,
  startEmailUpdate,
  updatePassword,
  updateAccount
} = require('./lib/middleware/account')

const {
  validateLogin,
  createUserSession,
  clearSession,
  getSession,
  resetSession,
  disableCsrf
} = require('./lib/middleware/session')

const {
  generatePasswordResetEmail
} = require('./lib/middleware/forgotPassword')

const {
  validatePasswordReset,
  getPasswordTokens
} = require('./lib/middleware/passwordReset')

const { slowDown } = require('./lib/middleware/slowDown')

const { httpsRedirect } = require('./lib/middleware/httpsRedirect')

const { adaptNext } = require('./lib/middleware/next')

const { relay } = require('./lib/middleware/relay')

const swap = require('./lib/utilities/swap')
const getRandomTimeout = require('./lib/utilities/getRandomTimeout')
const getTestEmail = require('./lib/utilities/getTestEmail')
const extractEmailToken = require('./lib/utilities/extractEmailToken')
const getHostUrl = require('./lib/utilities/getHostUrl')
const plugBefore = require('./lib/utilities/plugBefore')
const plugAfter = require('./lib/utilities/plugAfter')

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
  testError,

  // Serving:
  serveStatic,

  // Result:
  addToResponse,
  redirect,
  noContent,

  // Token:
  generateToken,
  insertToken,
  verifyToken,

  // Password:
  hashPassword,
  comparePasswords,

  // Authorization:
  requireAuthorization,

  // Email:
  validateEmail,
  sendEmail,

  // Email Verification:
  disableCsrf,
  generateEmailVerificationEmail,
  validateEmailVerification,
  getEmailTokens,
  getAccount,
  verifyEmail,
  emailVerification: [
    disableCsrf,
    validateEmailVerification,
    getEmailTokens,
    verifyToken,
    verifyEmail,
    getAccount,
    createUserSession,
    reduceAccountForClient,
    addToResponse
  ],

  // Resend Email Verification:
  startEmailVerification,
  resendEmailVerification: [
    disableCsrf,
    validateEmail,
    getAccount,
    ...startEmailVerification,
    addToResponse
  ],

  // Registration:
  validateRegistration,
  createAccount,
  registration: [
    disableCsrf,
    validateRegistration,
    hashPassword,
    createAccount,
    ...startEmailVerification,
    addToResponse
  ],

  // Get Session:
  resetSession,
  session: [
    reduceAccountForClient,
    getSession,
    addToResponse
  ],

  // Account:
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
    disableCsrf,
    validateLogin,
    getAccount,
    comparePasswords,
    clearSession,
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
    disableCsrf,
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
  getPasswordTokens,
  updatePassword,
  passwordReset: [
    disableCsrf,
    validatePasswordReset,
    getAccount,
    getPasswordTokens,
    verifyToken,
    verifyEmail,
    hashPassword,
    updatePassword,
    createUserSession,
    reduceAccountForClient,
    addToResponse
  ],

  // Account Update:
  validateAccountUpdate,
  startEmailUpdate,
  updateAccount,
  accountUpdate: [
    requireAuthorization,
    validateAccountUpdate,
    getAccount,
    comparePasswords,
    hashPassword,
    startEmailUpdate,
    updateAccount,
    reduceAccountForClient,
    addToResponse
  ],

  // Client Logging:
  logClientMessage,
  clientLogging: [
    logClientMessage,
    addToResponse
  ],

  // Slow down / rate limiting:
  slowDown,

  // HTTP to HTTPS redirect:
  httpsRedirect,

  // Adapt Next.js middleware to be executed with the nrg request context.
  adaptNext,

  // Relay requests to other servers.
  relay,

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
  AccountRole,

  /**
   * Utilities:
   */

  swap,
  getRandomTimeout,
  getTestEmail,
  extractEmailToken,
  getHostUrl,
  plugBefore,
  plugAfter,

  /**
   * App methods:
   */
  serve,

  /**
   * Default config:
   */

  defaults: config()
}
