const SchemaValidator = require('./lib/SchemaValidator.js')
const {
  isString,
  isBoolean,
  isInteger,
  isArray,
  isEmail,
  isPhone,
  isDate,
  isStrongPassword
} = require('./lib/validators.js')
const { trim, lowercase } = require('./lib/modifiers.js')

module.exports = {
  SchemaValidator,
  trim,
  lowercase,
  isString,
  isBoolean,
  isInteger,
  isArray,
  isEmail,
  isPhone,
  isDate,
  isStrongPassword,
  isOptional: true,
  ignoreEmpty: true
}
