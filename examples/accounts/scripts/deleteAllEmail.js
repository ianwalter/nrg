import { requester } from '@ianwalter/requester'

const host = process.env.MAILDEV_HOST || 'localhost'
const port = process.env.MAILDEV_PORT
export async function run () {
  return requester.delete(`http://${host}:${port}/email/all`)
}
