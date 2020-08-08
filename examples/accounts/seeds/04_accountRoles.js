const { AccountRole } = require('@ianwalter/nrg')
const { accounts } = require('./01_accounts')
const { roles } = require('./03_roles')

const ownerUser = accounts.find(a => a.firstName === 'Owner')
const ownerRole = roles.find(r => r.name === 'owner')
const adminUser = accounts.find(a => a.firstName === 'Admin')
const adminRole = roles.find(r => r.name === 'admin')
const accountRoles = [
  new AccountRole({
    accountId: ownerUser.id,
    roleId: ownerRole.id
  }),
  new AccountRole({
    accountId: adminUser.id,
    roleId: adminRole.id
  })
]

module.exports = {
  accountRoles,
  seed: async knex => {
    await knex.raw('TRUNCATE TABLE account_roles CASCADE')
    return knex('account_roles').insert(accountRoles)
  }
}
