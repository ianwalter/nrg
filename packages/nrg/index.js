import { Model } from 'objection'

import createApp from './lib/createApp.js'

import Base from './lib/models/Base.js'
import Account from './lib/models/Account.js'
import Token from './lib/models/Token.js'
import Role from './lib/models/Role.js'
import AccountRole from './lib/models/AccountRole.js'

import {
  GeneralError,
  HttpError,
  BadRequestError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ValidationError
} from './lib/errors.js'

import {
  enrichAndLogError,
  addErrorToResponse,
  handleError
} from './lib/middleware/error.js'

import { addToResponse, addToSsr, redirect } from './lib/middleware/end.js'

import {
  serveStatic,
  serveWebpack,
  logClientMessage
} from './lib/middleware/client.js'

import { serveSsr } from './lib/middleware/ssr.js'

import {
  generateToken,
  insertToken,
  verifyToken
} from './lib/middleware/token.js'

import {
  validatePasswordStrength,
  hashPassword,
  comparePasswords
} from './lib/middleware/password.js'

import { requireAuthorization } from './lib/middleware/authorization.js'

import { validateEmail, sendEmail } from './lib/middleware/email.js'

import {
  validateRegistration,
  createAccount
} from './lib/middleware/registration.js'

import {
  generateEmailVerificationEmail,
  startEmailVerification,
  validateEmailVerification,
  getEmailTokens,
  verifyEmail
} from './lib/middleware/emailVerification.js'

import {
  getAccount,
  reduceAccountForClient,
  validateAccountUpdate,
  validatePasswordUpdate,
  startEmailUpdate,
  updatePassword,
  updateAccount
} from './lib/middleware/account.js'

import {
  validateLogin,
  createUserSession,
  clearSession,
  getSession,
  resetSession,
  disableCsrf
} from './lib/middleware/session.js'

import {
  generatePasswordResetEmail
} from './lib/middleware/forgotPassword.js'

import {
  validatePasswordReset,
  getPasswordTokens
} from './lib/middleware/passwordReset.js'

import { slowDown } from './lib/middleware/slowDown.js'

import { httpsRedirect } from './lib/middleware/httpsRedirect.js'

import { adaptNext } from './lib/middleware/next.js'

import swap from './lib/utilities/swap.js'
import getRandomTimeout from './lib/utilities/getRandomTimeout.js'
import getTestEmail from './lib/utilities/getTestEmail.js'
import extractEmailToken from './lib/utilities/extractEmailToken.js'
import getHostUrl from './lib/utilities/getHostUrl.js'
import plugBefore from './lib/utilities/plugBefore.js'
import plugAfter from './lib/utilities/plugAfter.js'

import serve from './lib/app/serve.js'

import config from './lib/config.js'

export default {
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
