const nrg = require('@ianwalter/nrg')

const app = nrg.createApp({
  name: 'Accounts Example',
  port: 9999,
  keys: ['terra', 'incognita'],
  // log: { level: 'debug' },
  db: {
    connection: {
      database: 'nrg',
      user: 'nrg',
      password: 'gottaLottaEnemies'
    }
  },
  email: {
    from: {
      name: 'Account Example Support Team',
      address: 'support@example.com'
    }
  },
  accounts: { enabled: true }
})

// Allow users to get their session data.
app.get('/session', ...nrg.session)

// Allow users to login.
app.post('/registration', ...nrg.registration)

// Allow users to verify their email address.
app.post('/verify-email', ...nrg.emailVerification)

// Allow users to trigger their email verification email to be resent.
app.post('/resend-email-verification', ...nrg.resendEmailVerification)

// Allow users to login.
app.post('/login', ...nrg.login)

// Allow users to retrieve their account data.
app.get('/account', ...nrg.account)

// Allow users to update their account data.
app.put('/account', ...nrg.accountUpdate)

// Allow users to logout.
app.delete('/logout', ...nrg.logout)

// Allow users to start the password reset process.
app.post('/forgot-password', ...nrg.forgotPassword)

// Allow users to reset their password.
app.post('/reset-password', ...nrg.passwordReset)

// Allow users with the admin role to access this endpoint.
app.get('/admin', nrg.requireAuthorization({ roles: ['admin'] }), ctx => {
  ctx.body = 'Welcome admin!'
})

// Allow users with the admin or owner role to access this endpoint.
app.get('/hi', nrg.requireAuthorization({ roles: ['admin', 'owner'] }), ctx => {
  ctx.body = 'Hiya boss!'
})

module.exports = app
