const roles = [
  {
    id: 1,
    name: 'owner',
    level: 999
  },
  {
    id: 2,
    name: 'admin',
    level: 99
  }
]

module.exports = {
  roles,
  seed: async knex => {
    await knex.raw('TRUNCATE TABLE roles RESTART IDENTITY CASCADE')
    return knex('roles').insert(roles)
  }
}
