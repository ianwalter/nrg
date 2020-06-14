const { requester } = require('@ianwalter/requester')
const clone = require('@ianwalter/clone')
const cheerio = require('cheerio')
const replaceAll = require('replace-string')

function swap (list, map) {
  const newList = list.slice(0)
  for (const [key, middleware] of Object.entries(map)) {
    const index = newList.findIndex(f => f.name === key)
    if (index) {
      newList[index] = middleware
    }
  }
  return newList
}

const getRandomTimeout = (max = 2000, min = 500) => Math.max(
  Math.floor(Math.random() * Math.floor(max)),
  min
)

async function getTestEmail (byEmail) {
  const host = process.env.SMTP_HOST || 'localhost'
  const port = process.env.SMTP_PORT ? 80 : 2080
  const { body } = await requester.get(`http://${host}:${port}/email`)
  const email = body.find(byEmail)
  if (email) await requester.delete(`http://${host}:${port}/email/${email.id}`)
  return email
}

async function extractEmailToken (byEmail, selector = '.button') {
  const email = clone(await getTestEmail(byEmail))

  const $ = cheerio.load(email.html)
  const url = new URL($(selector).attr('href'))
  const token = url.searchParams.get('token')

  // Replace the token string with an arbitrary string so that the email body
  // can more easily be used with a snapshot matcher.
  email.html = replaceAll(email.html, token, '<~ TOKEN WAS HERE ~>')

  return { email, token }
}

module.exports = { swap, getRandomTimeout, getTestEmail, extractEmailToken }
