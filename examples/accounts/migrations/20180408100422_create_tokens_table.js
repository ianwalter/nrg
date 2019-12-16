exports.up = knex => knex.schema.createTable('tokens', t => {
  t.increments()
  t.string('value').unique().notNullable()
  t.enum('type', ['email', 'password']).index().notNullable()
  t.string('email').index().notNullable()
  t.timestamp('expiresAt').notNullable()
  t.timestamps(true, true)

  t.foreign('email').references('email').inTable('accounts')
})

exports.down = knex => knex.schema.dropTable('tokens')
