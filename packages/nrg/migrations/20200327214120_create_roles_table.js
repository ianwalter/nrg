exports.up = knex => knex.schema.createTable('roles', t => {
  t.string('id').primary()
  t.string('name').notNullable()
  t.string('scope').notNullable().defaultsTo('user')
  t.timestamps(true, true)
})

exports.down = knex => knex.schema.dropTable('roles')
