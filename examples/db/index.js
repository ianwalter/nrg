const { createApp, Account } = require('../')

const app = createApp({ accounts: { enabled: true } })

app.use(async ctx => {
  const accounts = await Account.query()
  ctx.body = accounts.map(account => account.getOwnData())
})

app.start('http://localhost:3000')
