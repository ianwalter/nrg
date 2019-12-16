const bcrypt = require('bcrypt')

const password = 'iJustC4n7!gnore'
const salt = bcrypt.genSaltSync(12)
const accounts = [
  {
    firstName: 'Julian',
    lastName: 'Grimes',
    email: 'jgrimes@example.com',
    password: bcrypt.hashSync(password, salt)
  }
]

module.exports = {
  password,
  accounts,
  seed: async knex => {
    await knex.raw('TRUNCATE TABLE accounts RESTART IDENTITY CASCADE')
    return knex('accounts').insert(accounts)
  }
}
