export const up = knex => knex.schema.createTable('roles', t => {
  t.string('id').primary()
  t.string('name').notNullable()
  t.string('scope').notNullable().defaultsTo('app')
  t.timestamps(true, true)
})

export const down = knex => knex.schema.dropTable('roles')
