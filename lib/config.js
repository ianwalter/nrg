const bodyParser = require('koa-bodyparser')
const { knexSnakeCaseMappers } = require('objection')
const readPkgUp = require('read-pkg-up')
const {
  SchemaValidator,
  isEmail,
  isStrongPassword,
  isString
} = require('@ianwalter/correct')
const { handleError } = require('./middleware/error')
const { setRequestId } = require('./middleware/requestId')
const { httpsRedirect } = require('./middleware/httpsRedirect')
const Account = require('./models/Account')
const Token = require('./models/Token')

// Get the end-user's package.json data so that it can be used to provide
// defaults.
const { packageJson = {} } = readPkgUp.sync() || {}

module.exports = function config (options = {}) {
  return {
    name: packageJson.name || 'nrg app',
    env: process.env.NRG_ENV || process.env.APP_ENV,
    isDev: !process.env.NODE_ENV || process.env.NODE_ENV === 'development',
    isTest: process.env.NODE_ENV === 'test',
    isProd: process.env.NODE_ENV === 'production',
    get host () {
      return process.env.NRG_HOST || this.isProd ? '0.0.0.0' : 'localhost'
    },
    get port () {
      return process.env.NRG_PORT || process.env.PORT
    },
    get hostUrl () {
      return `http://${this.host}${this.port ? `:${this.port}` : ''}`
    },
    get baseUrl () {
      return process.env.NRG_BASE_URL || this.hostUrl
    },
    get log () {
      const isProd = this.isProd
      return {
        level: this.isDev ? 'debug' : (this.isTest ? 'error' : 'info'),
        unhandled: true,
        get prettyPrint () {
          return isProd ? false : { static: '/static/', level: this.level }
        },
        get prettifier () {
          return isProd && this.prettyPrint
            ? false
            : require('@ianwalter/pino-print')
        },
        get redact () {
          return this.level !== 'debug'
            ? ['req.headers.cookie', 'res.headers["set-cookie"]']
            : []
        },
        genReqId: req => req.id
      }
    },
    handleError,
    setRequestId,
    router: true,
    health: { path: '/health' },
    get prettyJson () {
      return this.isDev
    },
    compress: true,
    middleware: {
      httpsRedirect,
      bodyParser: bodyParser({ enableTypes: ['json', 'form', 'text'] })
    },
    static: {
      get enabled () {
        return Object.keys(this.options).length > 0 || this.webpack.enabled
      },
      options: {},
      webpack: {
        enabled: false,
        options: {
          devMiddleware: {
            serverSideRender: true,
            publicPath: '/static'
          }
        }
      }
    },
    get redis () {
      const areSessionsEnabled = this.sessions.enabled
      return {
        get enabled () {
          return areSessionsEnabled || Object.keys(this.connection).length > 0
        },
        connection: {}
      }
    },
    sessions: {
      get enabled () {
        return !!(this.keys && this.keys.length)
      }
    },
    db: {
      get enabled () {
        return !!this.connection
      },
      client: 'pg',
      ...knexSnakeCaseMappers()
    },
    hash: { bytes: 48, rounds: 12 },
    get email () {
      return {
        // Email functionality is enabled if the accounts functionality is
        // enabled or if the user-passed options has a truthy email property.
        enabled: this.accounts.enabled || !!options.email,
        transport: { pool: this.isProd, ignoreTLS: this.isDev || this.isTest },
        mailgen: {
          product: {
            name: this.name || packageJson.name,
            link: this.baseUrl
          }
        },
        templates: {
          emailVerification: {
            action: {
              instructions: 'To get started, please click here:',
              button: {
                text: 'Verify your account'
              }
            }
          },
          passwordReset: {
            action: {
              instructions: 'Click the button below to reset your password:',
              button: {
                text: 'Reset your password'
              }
            }
          }
        }
      }
    },
    get accounts () {
      const rounds = this.hash.rounds
      return {
        enabled: !!options.accounts,
        dummyPassword: 'ijFu54r6PyNdrN',
        get encryptedDummyPassword () {
          if (this.enabled) {
            const bcrypt = require('bcrypt')
            const salt = bcrypt.genSaltSync(rounds)
            return bcrypt.hashSync(this.dummyPassword, salt)
          }
          return this.dummyPassword
        },
        models: {
          Account,
          Token
        }
      }
    },
    get validators () {
      const Account = this.accounts.models.Account
      const email = { isEmail }
      const token = { isString }
      const password = { isStrongPassword }
      const passwordUpdate = { password, newPassword: password }
      return {
        login: new SchemaValidator(Account.loginSchema),
        registration: new SchemaValidator(Account.registrationSchema),
        email: new SchemaValidator({ email }),
        emailVerification: new SchemaValidator({ email, token }),
        passwordReset: new SchemaValidator({ email, token, password }),
        passwordUpdate: new SchemaValidator(passwordUpdate),
        accountUpdate: new SchemaValidator(Account.updateSchema)
      }
    },
    mq: {
      get enabled () {
        return !!(this.urls || this.queues)
      }
    }
  }
}
