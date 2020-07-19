const { requester } = require('@ianwalter/requester')

const host = process.env.SMTP_HOST || 'localhost'
const port = process.env.MAILDEV_PORT
module.exports = async () => requester.delete(`http://${host}:${port}/email/all`)
