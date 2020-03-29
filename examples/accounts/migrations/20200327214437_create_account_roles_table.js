exports.up = knex => knex.schema.createTable('accountRoles', t => {
  t.increments()
  t.integer('accountId').unsigned().notNullable()
  t.integer('roleId').unsigned().notNullable()
  t.timestamps(true, true)

  t.foreign('accountId').references('id').inTable('accounts')
  t.foreign('roleId').references('id').inTable('roles')
})

exports.down = knex => knex.schema.dropTable('accountRoles')
