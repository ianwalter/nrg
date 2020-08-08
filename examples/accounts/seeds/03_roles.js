const { Role } = require('@ianwalter/nrg')

const roles = [
  new Role({
    id: 1,
    name: 'owner'
  }),
  new Role({
    id: 2,
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
