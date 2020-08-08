const bcrypt = require('bcrypt')
const addDays = require('date-fns/addDays')
const subDays = require('date-fns/subDays')
const { excluding } = require('@ianwalter/extract')
const { Token } = require('@ianwalter/nrg')
const { accounts } = require('./01_accounts')

const salt = bcrypt.genSaltSync(12)
const previousEmailUser = accounts.find(a => a.firstName === 'Previous Email')
const expiredEmailUser = accounts.find(a => a.firstName === 'Expired Email')
const wrongEmailUser = accounts.find(a => a.firstName === 'Wrong Email')
const mismatchEmailUser = accounts.find(a => a.firstName === 'Mismatch Email')
const readOnlyUser = accounts.find(a => a.firstName === 'Read Only')
const tokens = [
  new Token({
    id: 'previous',
    token: 'iJustC4n7!gnore',
    value: bcrypt.hashSync('iJustC4n7!gnore', salt),
    type: 'email',
    accountId: previousEmailUser.id,
    email: previousEmailUser.email,
    expiresAt: addDays(new Date(), 1).toISOString()
  }),
  new Token({
    id: 'expired',
    token: 'theSp@rksSt!llThere',
    value: bcrypt.hashSync('theSp@rksSt!llThere', salt),
    type: 'email',
    accountId: expiredEmailUser.id,
    email: expiredEmailUser.email,
    expiresAt: subDays(new Date(), 1).toISOString()
  }),
  new Token({
    id: 'wrong',
    token: '!sntItPr3ttyT0ThinkS0',
    value: bcrypt.hashSync('!sntItPr3ttyT0ThinkS0', salt),
    type: 'email',
    accountId: wrongEmailUser.id,
    email: wrongEmailUser.email,
    expiresAt: addDays(new Date(), 1).toISOString()
  }),
  new Token({
    id: 'mismatch',
    token: '!mStvckFor3v3rInUrMind',
    value: bcrypt.hashSync('!mStvckFor3v3rInUrMind', salt),
    type: 'email',
    accountId: mismatchEmailUser.id,
    email: mismatchEmailUser.email,
    expiresAt: addDays(new Date(), 1).toISOString()
  }),
  new Token({
    id: 'read',
    token: 'f@!lure8yD3s!gn',
    value: bcrypt.hashSync('f@!lure8yD3s!gn', salt),
    type: 'password',
    accountId: readOnlyUser.id,
    email: readOnlyUser.email,
    expiresAt: addDays(new Date(), 1).toISOString()
  })
]

module.exports = {
  tokens,
  seed: async knex => {
    await knex.raw('TRUNCATE TABLE tokens CASCADE')
    return knex('tokens').insert(tokens.map(t => excluding(t, 'token')))
  }
}
