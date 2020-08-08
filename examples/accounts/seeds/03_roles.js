const { Role } = require('@ianwalter/nrg')

const roles = [
  new Role({
    id: 'owner',
    name: 'owner'
  }),
  new Role({
    id: 'admin',
    name: 'admin'
  })
]

module.exports = {
  roles,
  seed: async knex => {
    await knex.raw('TRUNCATE TABLE roles CASCADE')
    return knex('roles').insert(roles)
  }
}
