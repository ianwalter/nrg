const { requester } = require('@ianwalter/requester')

const host = 'localhost'
const port = process.env.MAILDEV_PORT
module.exports = async function getTestEmail (byEmail) {
  const { body } = await requester.get(`http://${host}:${port}/email`)
  const email = body.find(byEmail)
  if (email) await requester.delete(`http://${host}:${port}/email/${email.id}`)
  return email
}
