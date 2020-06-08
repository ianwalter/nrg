const { accounts } = require('./01_accounts')
const { roles } = require('./03_roles')

const ownerUser = accounts.find(a => a.firstName === 'Owner User')
const ownerRole = roles.find(r => r.name === 'owner')
const adminUser = accounts.find(a => a.firstName === 'Admin User')
const adminRole = roles.find(r => r.name === 'admin')
const accountRoles = [
  {
    accountId: ownerUser.id,
    roleId: ownerRole.id
  },
  {
    accountId: adminUser.id,
    roleId: adminRole.id
  }
]

module.exports = {
  accountRoles,
  seed: async knex => {
    await knex.raw('TRUNCATE TABLE account_roles RESTART IDENTITY CASCADE')
    return knex('account_roles').insert(accountRoles)
  }
}
