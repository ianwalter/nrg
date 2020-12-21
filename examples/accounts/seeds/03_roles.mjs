const roles = [
  {
    id: 'owner',
    name: 'owner'
  },
  {
    id: 'admin',
    name: 'admin'
  }
]

async function seed (knex) {
  await knex.raw('TRUNCATE TABLE roles CASCADE')
  return knex('roles').insert(roles)
}

export { roles, seed }
