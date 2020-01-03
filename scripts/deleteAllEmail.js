const { requester } = require('@ianwalter/requester')

const host = process.env.SMTP_HOST || 'localhost'
module.exports = async () => requester.delete(`http://${host}:1080/email/all`)
