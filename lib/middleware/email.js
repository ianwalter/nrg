const ejs = require('ejs')
const fs = require('fs')
const path = require('path')

// Compile the email EJS templates into render functions that will be used to
// render the emails given the necessary data in the middleware below.
const emailsPath = path.join(__dirname, '..', 'emails', 'dist')
const renderEmailVerificationEmail = ejs.compile(
  fs.readFileSync(path.join(emailsPath, 'emailVerification.ejs'), 'utf8')
)
const renderPasswordResetEmail = ejs.compile(
  fs.readFileSync(path.join(emailsPath, 'passwordReset.ejs'), 'utf8')
)

function generateEmailVerificationEmail (ctx, next) {
  ctx.email = {
    to: ctx.account.email,
    subject: `${ctx.app.options.name} Verification Email`,
    html: renderEmailVerificationEmail({
      baseUrl: ctx.app.baseUrl,
      token: ctx.token
    })
  }
}

function generatePasswordResetEmail (ctx, next) {
  ctx.email = {
    to: ctx.email,
    subject: `${ctx.app.options.name} Password Reset`,
    html: renderPasswordResetEmail({
      baseUrl: ctx.app.baseUrl,
      token: ctx.token
    })
  }
}

function sendEmail (ctx, next) {
  // Send the email verification email to the user with a URL that includes the
  // token so that they can navigate to a part of the application that will
  // allow them to perform verification andf generate a new session if
  // necessary.
  const { fromEmail, replyEmail } = ctx.app.options.accounts
  const email = {
    ...fromEmail ? { from: fromEmail } : {},
    ...replyEmail ? { replyTo: replyEmail } : {}
  }
  // TODO:
  this.nodemailer.sendMail(
    { ...email, ...ctx.email },
    err => {
      if (err) {
        // TODO:
        this.app.emit('error', err, this)
      }
    }
  )

}

module.exports = { 
  generateEmailVerificationEmail,
  generatePasswordResetEmail,
  sendEmail
}
