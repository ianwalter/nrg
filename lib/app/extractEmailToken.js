const clone = require('@ianwalter/clone')
const cheerio = require('cheerio')
const replaceAll = require('replace-string')

async function extractEmailToken (byEmail, selector = '.button') {
  const email = clone(await this.getTestEmail(byEmail))

  const $ = cheerio.load(email.html)
  const url = new URL($(selector).attr('href'))
  const token = url.searchParams.get('token')

  // Replace the token string with an arbitrary string so that the email body
  // can more easily be used with a snapshot matcher.
  email.html = replaceAll(email.html, token, '<~ TOKEN WAS HERE ~>')

  return { email, token }
}

module.exports = extractEmailToken
