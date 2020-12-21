import isPhone from 'is-phone'
import ie from 'isemail'
import { parseISO, isValid } from 'date-fns'
import zxcvbn from 'zxcvbn'
import { merge } from '@generates/merger'

export function resultIsValid (result) {
  return result.isValid
}

export function isString (input) {
  return resultIsValid(isString.validate(input))
}
isString.validate = function validateString (input) {
  return { isValid: typeof input === 'string' && input.length > 0 }
}

export function isBoolean (input) {
  return resultIsValid(isBoolean.validate(input))
}
isBoolean.validate = function validateBoolean (input) {
  return { isValid: typeof input === 'boolean' }
}

const defaultEmailOptions = { minDomainAtoms: 2 }
export function isEmail (input, options) {
  return resultIsValid(isEmail.validate(input, options))
}
isEmail.validate = function validateEmail (input, options) {
  return {
    isValid: ie.validate(input, merge({}, defaultEmailOptions, options))
  }
}

export function isDate (input) {
  return resultIsValid(isDate.validate(input))
}
isDate.validate = function validateDate (input) {
  return {
    isValid: isValid(typeof input === 'string' ? parseISO(input) : input)
  }
}

export function isStrongPassword (password, inputs) {
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

export { isPhone }
