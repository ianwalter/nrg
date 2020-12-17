import clone from '@ianwalter/clone'
import cheerio from 'cheerio'
import replaceAll from 'replace-string'
import getTestEmail from './getTestEmail.js'

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

export default extractEmailToken
