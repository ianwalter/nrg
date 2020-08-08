exports.up = knex => knex.schema.createTable('tokens', t => {
  t.string('id').primary()
  t.string('value').unique().notNullable()
  t.string('accountId').notNullable().index()
  t.enum('type', ['email', 'password']).notNullable().index()
  t.string('email').notNullable().index()
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
