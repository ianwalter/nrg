const speakeasy = require('speakeasy')
const { ValidationError } = require('../errors')

module.exports = async function verifyTwoFactor (ctx, next) {
  const body = ctx.request.body || ctx.req.body || {}
  const validation = await ctx.cfg.validators.twoFactor.validate(body)
  if (validation.isValid) {
    const isVerified = speakeasy.totp.verify({
      secret: ctx.session.twoFactorSecret,
      encoding: 'base32',
      token: validation.data.code
    })

    if (isVerified) {
      
    }

    return next()
  }
  throw new ValidationError(validation)
}
