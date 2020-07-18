const { requester } = require('@ianwalter/requester')

module.exports = async function getTestEmail (byEmail) {
  const { host = 'localhost', port = 1080 } = this.cfg.email.transport
  const { body } = await requester.get(`http://${host}:${port}/email`)
  const email = body.find(byEmail)
  if (email) await requester.delete(`http://${host}:${port}/email/${email.id}`)
  return email
}
