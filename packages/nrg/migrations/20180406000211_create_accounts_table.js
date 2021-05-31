exports.up = knex => knex.schema.createTable('accounts', t => {
  t.string('id').primary()
  t.string('username').unique().index()
  t.string('firstName').notNullable()
  t.string('lastName').notNullable()
  t.string('email').unique().notNullable().index()
  t.string('password').notNullable()
  t.boolean('emailVerified').notNullable().defaultTo(false)
  t.boolean('enabled').notNullable().defaultTo(true)
  t.timestamps(true, true)
})

exports.down = knex => knex.schema.dropTable('accounts')
