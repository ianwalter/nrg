const { requester } = require('@ianwalter/requester')

const host = process.env.SMTP_HOST || 'localhost'
const port = process.env.SMTP_PORT ? 80 : 1080
module.exports = async () => requester.delete(`http://${host}:${port}/email/all`)
