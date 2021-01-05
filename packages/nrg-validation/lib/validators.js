const isPhone = require('is-phone')
const ie = require('isemail')
const { parseISO, isValid } = require('date-fns')
const zxcvbn = require('zxcvbn')
const { merge } = require('@generates/merger')

function resultIsValid (result) {
  return result.isValid
}

function isString (input) {
  return resultIsValid(isString.validate(input))
}
isString.validate = function validateString (input) {
  return { isValid: typeof input === 'string' && input.length > 0 }
}

function isBoolean (input) {
  return resultIsValid(isBoolean.validate(input))
}
isBoolean.validate = function validateBoolean (input) {
  return { isValid: typeof input === 'boolean' }
}

const defaultEmailOptions = { minDomainAtoms: 2 }
function isEmail (input, options) {
  return resultIsValid(isEmail.validate(input, options))
}
isEmail.validate = function validateEmail (input, options) {
  return {
    isValid: ie.validate(input, merge({}, defaultEmailOptions, options))
  }
}

function isDate (input) {
  return resultIsValid(isDate.validate(input))
}
isDate.validate = function validateDate (input) {
  return {
    isValid: isValid(typeof input === 'string' ? parseISO(input) : input)
  }
}

function isStrongPassword (password, inputs) {
  return resultIsValid(isStrongPassword.validate(password, inputs))
}
isStrongPassword.validate = function validateStrongPassword (password, inputs) {
  const result = zxcvbn(password, inputs)
  return {
    isValid: result.score > 2,
    message: result.feedback.warning,
    feedback: result.feedback.suggestions,
    result
  }
}

module.exports = {
  isPhone,
  resultIsValid,
  isString,
  isBoolean,
  isEmail,
  isDate,
  isStrongPassword
}
