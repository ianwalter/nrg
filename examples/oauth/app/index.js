import fs from 'fs'
import path from 'path'
import { createApp } from '@ianwalter/nrg'

const app = await createApp({
  oauth: {
    github: {
      client_id: process.env.GITHUB_CLIENT_ID,
      client_secret: process.env.GITHUB_CLIENT_SECRET,
      callback: '/hello',
      response: ['tokens', 'profile']
    }
  }
})

const index = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf-8')
app.get('/', ctx => {
  ctx.type = 'text/html'
  ctx.body = index
})

app.get('/hello', ctx => {
  ctx.logger.debug('Hello', ctx.session)
  ctx.body = `Hello ${ctx.session.grant.response.profile.name}!`
})

export default app
