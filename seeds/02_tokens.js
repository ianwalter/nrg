const bcrypt = require('bcrypt')
const addDays = require('date-fns/addDays')
const subDays = require('date-fns/subDays')
const { excluding } = require('@ianwalter/extract')
const { accounts } = require('./01_accounts')

const salt = bcrypt.genSaltSync(12)
const adminUser = accounts.find(a => a.firstName === 'Admin')
const ownerUser = accounts.find(a => a.firstName === 'Owner')
const readOnlyUser = accounts.find(a => a.firstName === 'Read Only')
const tokens = [
  {
    token: 'iJustC4n7!gnore',
    value: bcrypt.hashSync('iJustC4n7!gnore', salt),
    type: 'email',
    accountId: adminUser.id,
    email: adminUser.email,
    expiresAt: addDays(new Date(), 1).toISOString()
  },
  {
    token: 'theSp@rksSt!llThere',
    value: bcrypt.hashSync('theSp@rksSt!llThere', salt),
    type: 'email',
    accountId: adminUser.id,
    email: ownerUser.email,
    expiresAt: subDays(new Date(), 1).toISOString()
  },
  {
    token: '!sntItPr3ttyT0ThinkS0',
    value: bcrypt.hashSync('!sntItPr3ttyT0ThinkS0', salt),
    type: 'email',
    accountId: readOnlyUser.id,
    email: readOnlyUser.email,
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
