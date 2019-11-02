function generateVerificationEmail (ctx, next) {
:q:
}

function generateResetEmail (ctx, next) {

}

function sendEmail (ctx, next) {
  // Send the email verification email to the user with a URL that includes the
  // token so that they can navigate to a part of the application that will
  // allow them to perform verification andf generate a new session if
  // necessary.
  this.nodemailer.sendMail(
    {
      to: user.email,
      from: this.supportEmail,
      subject: 'Polychill.com Email Verfication',
      html: renderEmailVerification({ appUrl: this.appUrl, token })
    },
    err => {
      if (err) {
        this.app.emit('error', err, this)
      }
    }
  )

}

module.exports = { sendEmail }
