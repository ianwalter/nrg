exports.up = knex => knex.schema.createTable('tokens', t => {
  t.increments()
  t.string('value').unique().notNullable()
  t.integer('accountId').unsigned().notNullable().index()
  t.enum('type', ['email', 'password']).index().notNullable()
  t.string('email').index().notNullable()
  t.timestamp('expiresAt').notNullable()
  t.timestamps(true, true)

  // Records need to be related by id and not email since an email address can
  // be changed.
  t
    .foreign('accountId')
    .references('id')
    .inTable('accounts')
    .onDelete('CASCADE')
})

exports.down = knex => knex.schema.dropTable('tokens')
