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

module.exports = {
  roles,
  seed: async knex => {
    await knex.raw('TRUNCATE TABLE roles CASCADE')
    return knex('roles').insert(roles)
  }
}
