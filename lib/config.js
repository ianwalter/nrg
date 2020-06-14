const bodyParser = require('koa-bodyparser')
const { knexSnakeCaseMappers } = require('objection')
const readPkgUp = require('read-pkg-up')
const {
  SchemaValidator,
  isEmail,
  isStrongPassword,
  isString,
  isOptional
} = require('@ianwalter/correct')
const { handleError } = require('./middleware/error')
const { setRequestId } = require('./middleware/requestId')
const { httpsRedirect } = require('./middleware/httpsRedirect')
const Account = require('./models/Account')
const Token = require('./models/Token')

// Get the end-user's package.json data so that it can be used to provide
// defaults.
const { packageJson = {} } = readPkgUp.sync() || {}
const email = { isEmail }
const token = { isString }
const password = { isStrongPassword }

module.exports = function config (options = {}) {
  const cfg = {
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
    log: {
      get level () {
        return cfg.isDev ? 'debug' : (cfg.isTest ? 'error' : 'info')
      },
      unhandled: true,
      get prettyPrint () {
        return cfg.isProd ? false : { static: '/static/', level: this.level }
      },
      get prettifier () {
        return cfg.isProd && this.prettyPrint
          ? false
          : require('@ianwalter/pino-print')
      },
      get redact () {
        return this.level !== 'debug'
          ? ['req.headers.cookie', 'res.headers["set-cookie"]']
          : []
      },
      genReqId: req => req.id
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
        return this.webpack.enabled || !!options.static
      },
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
    redis: {
      get enabled () {
        return cfg.sessions.enabled || !!options.redis
      },
      connection: {}
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
    email: {
      // Email functionality is enabled if the accounts functionality is
      // enabled or if the user-passed options has a truthy email property.
      get enabled () {
        return cfg.accounts.enabled || !!options.email
      },
      get transport () {
        return { pool: cfg.isProd, ignoreTLS: cfg.isDev || cfg.isTest }
      },
      get replyTo () {
        return this.from
      },
      mailgen: {
        product: {
          get name () {
            return cfg.name || packageJson.name
          },
          get link () {
            return cfg.baseUrl
          }
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
    },
    accounts: {
      enabled: !!options.accounts,
      dummyPassword: 'ijFu54r6PyNdrN',
      get hashedDummyPassword () {
        if (this.enabled) {
          const bcrypt = require('bcrypt')
          const salt = bcrypt.genSaltSync(cfg.hash.rounds)
          return bcrypt.hashSync(this.dummyPassword, salt)
        }
        return this.dummyPassword
      },
      models: {
        Account,
        Token
      }
    },
    validators: {
      get login () {
        return new SchemaValidator(cfg.accounts.models.Account.loginSchema)
      },
      get registration () {
        const { Account } = cfg.accounts.models
        return new SchemaValidator(Account.registrationSchema)
      },
      email: new SchemaValidator({ email }),
      emailVerification: new SchemaValidator({ email, token }),
      passwordReset: new SchemaValidator({
        email,
        token,
        password,
        passwordConfirmation: { isString, isOptional }
      }),
      passwordUpdate: new SchemaValidator({ password, newPassword: password }),
      get accountUpdate () {
        return new SchemaValidator(cfg.accounts.models.Account.updateSchema)
      }
    },
    mq: {
      get enabled () {
        return !!(this.urls || this.queues)
      }
    }
  }

  return cfg
}
