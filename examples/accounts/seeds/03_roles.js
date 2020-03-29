const roles = [
  {
    id: 1,
    name: 'owner'
  },
  {
    id: 2,
    name: 'admin'
  }
]

module.exports = {
  roles,
  seed: async knex => {
    await knex.raw('TRUNCATE TABLE roles RESTART IDENTITY CASCADE')
    return knex('roles').insert(roles)
  }
}
