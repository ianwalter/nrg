export const roles = [
  {
    id: 'owner',
    name: 'owner'
  },
  {
    id: 'admin',
    name: 'admin'
  }
]

export async function seed (knex) {
  await knex.raw('TRUNCATE TABLE roles CASCADE')
  return knex('roles').insert(roles)
}
