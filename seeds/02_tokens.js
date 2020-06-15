const bcrypt = require('bcrypt')
const addDays = require('date-fns/addDays')
const subDays = require('date-fns/subDays')
const { excluding } = require('@ianwalter/extract')
const { accounts } = require('./01_accounts')

const salt = bcrypt.genSaltSync(12)
const previousEmailUser = accounts.find(a => a.firstName === 'Previous Email')
const expiredEmailUser = accounts.find(a => a.firstName === 'Expired Email')
const wrongEmailUser = accounts.find(a => a.firstName === 'Wrong Email')
const mismatchEmailUser = accounts.find(a => a.firstName === 'Mismatch Email')
const tokens = [
  {
    token: 'iJustC4n7!gnore',
    value: bcrypt.hashSync('iJustC4n7!gnore', salt),
    type: 'email',
    accountId: previousEmailUser.id,
    email: previousEmailUser.email,
    expiresAt: addDays(new Date(), 1).toISOString()
  },
  {
    token: 'theSp@rksSt!llThere',
    value: bcrypt.hashSync('theSp@rksSt!llThere', salt),
    type: 'email',
    accountId: expiredEmailUser.id,
    email: expiredEmailUser.email,
    expiresAt: subDays(new Date(), 1).toISOString()
  },
  {
    token: '!sntItPr3ttyT0ThinkS0',
    value: bcrypt.hashSync('!sntItPr3ttyT0ThinkS0', salt),
    type: 'email',
    accountId: wrongEmailUser.id,
    email: wrongEmailUser.email,
    expiresAt: addDays(new Date(), 1).toISOString()
  },
  {
    token: '!mStvckFor3v3rInUrMind',
    value: bcrypt.hashSync('!mStvckFor3v3rInUrMind', salt),
    type: 'email',
    accountId: mismatchEmailUser.id,
    email: mismatchEmailUser.email,
    expiresAt: addDays(new Date(), 1).toISOString()
  }
]

module.exports = {
  tokens,
  seed: async knex => {
    await knex.raw('TRUNCATE TABLE tokens RESTART IDENTITY CASCADE')
    return knex('tokens').insert(tokens.map(t => excluding(t, 'token')))
  }
}
