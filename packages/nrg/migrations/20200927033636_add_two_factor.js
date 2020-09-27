exports.up = knex => {
  knex.schema.table('accounts', table => table.string('twoFactorSecret'))
}

exports.down = knex => {
  knex.schema.table('accounts', table => table.dropColumn('twoFactorSecret'))
}
