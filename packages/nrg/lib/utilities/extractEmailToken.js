const clone = require('@ianwalter/clone')
const cheerio = require('cheerio')
const getTestEmail = require('./getTestEmail')

async function extractEmailToken (byEmail, selector = '.button') {
  const email = clone(await getTestEmail(byEmail))

  const $ = cheerio.load(email.html)
  const url = new URL($(selector).attr('href'))
  const token = url.searchParams.get('token')

  // Replace the token string with an arbitrary string so that the email body
  // can more easily be used with a snapshot matcher.
  email.html = email.html.replaceAll(token, '<~ TOKEN WAS HERE ~>')

  return { email, token }
}

module.exports = extractEmailToken
