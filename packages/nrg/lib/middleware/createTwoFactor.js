const speakeasy = require('speakeasy')
const QRCode = require('qrcode')

module.exports = async function createTwoFactor (ctx, next) {
  const secret = speakeasy.generateSecret()
  ctx.session.twoFactorSecret = secret.base32
  ctx.state.body = { dataUrl: await QRCode.toDataURL(secret.otpauth_url) }
  return next()
}
