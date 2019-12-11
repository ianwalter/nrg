const bcrypt = require('bcrypt')

const password = 'iJustC4n7!gnore'
const salt = bcrypt.genSaltSync(12)

module.exports = {
  password,
  seed: [
    {
      firstName: 'Julian',
      lastName: 'Grimes',
      email: 'jgrimes@example.com',
      password: bcrypt.hashSync(password, salt)
    }
  ]
}
