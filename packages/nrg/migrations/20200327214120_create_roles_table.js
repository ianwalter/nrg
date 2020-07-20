exports.up = knex => knex.schema.createTable('roles', t => {
  t.increments()
  t.string('name').notNullable()
  t.timestamps(true, true)
})

exports.down = knex => knex.schema.dropTable('roles')
