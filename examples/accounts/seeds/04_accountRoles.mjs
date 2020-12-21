import { accounts } from './01_accounts.mjs'
import { roles } from './03_roles.mjs'

const ownerUser = accounts.find(a => a.firstName === 'Owner')
const ownerRole = roles.find(r => r.name === 'owner')
const adminUser = accounts.find(a => a.firstName === 'Admin')
const adminRole = roles.find(r => r.name === 'admin')
const accountRoles = [
  {
    id: 'owner',
    accountId: ownerUser.id,
    roleId: ownerRole.id
  },
  {
    id: 'admin',
    accountId: adminUser.id,
    roleId: adminRole.id
  }
]

async function seed (knex) {
  await knex.raw('TRUNCATE TABLE account_roles CASCADE')
  return knex('account_roles').insert(accountRoles)
}

export { accountRoles, seed }
