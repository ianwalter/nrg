module.exports = function nrgAccounts (plug) {
  plug.in('config', function accounts (app, next) {
    app.config.plugins.redis = require('@ianwalter/nrg-redis')
    app.config.plugins.session = require('@ianwalter/nrg-session')
    app.config.plugins.csrf = require('@ianwalter/nrg-csrf')
    app.config.plugins.rateLimit = require('@ianwalter/nrg-rate-limit')
    app.config.plugins.db = require('@ianwalter/nrg-db')
    app.config.plugins.email = require('@ianwalter/nrg-email')
    return next()
  })
}

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
    Account: require('./models/Account'),
    Token: require('./models/Token')
  },
  passwordResetPath: '/reset-password'
},


validators: {
  get login () {
    const s = cfg.accounts.models.Account.loginSchema
    if (cfg.sessions.rememberMe) s.rememberMe = { isBoolean, canBeEmpty }
    return new SchemaValidator(s)
  },
  get registration () {
    const { Account } = cfg.accounts.models
    return new SchemaValidator(Account.registrationSchema)
  },
  email: new SchemaValidator({ email }),
  emailVerification: new SchemaValidator({ email, token }),
  password: new SchemaValidator({ password }),
  passwordReset: new SchemaValidator({
    email,
    token,
    password,
    passwordConfirmation: { canBeEmpty, shouldMatchPassword }
  }),
  get accountUpdate () {
    return new SchemaValidator({
      email: { isEmail, canBeEmpty, trim, lowercase },
      newPassword: { canBeEmpty, isStrongPassword },
      newPasswordConfirmation: { canBeEmpty, shouldMatchNewPassword },
      ...cfg.accounts.models.Account.updateSchema
    })
  }
},
