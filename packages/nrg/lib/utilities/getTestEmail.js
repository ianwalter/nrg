const { requester } = require('@ianwalter/requester')

module.exports = async function getTestEmail (byEmail, config = {}) {
  const { host = 'localhost', port = process.env.MAILDEV_PORT } = config
  const { body } = await requester.get(`http://${host}:${port}/email`)
  const email = body.find(byEmail)
  if (email) await requester.delete(`http://${host}:${port}/email/${email.id}`)
  return email
}
