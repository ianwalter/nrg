import parsePhoneNumber from 'libphonenumber-js'
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

export function isInteger (input) {
  return resultIsValid(isInteger.validate(input))
}
isInteger.validate = function validateInteger (input) {
  return { isValid: Number.isInteger(input) }
}

export function isArray (input) {
  if (typeof input === 'function') {
    const validator = input
    const givenArray = input => resultIsValid(givenArray.validate(input))
    givenArray.validate = function validateArrayOf (input) {
      const validation = { results: [] }
      validation.isValid = isArray(input) && input.every(item => {
        const result = validator.validate(item)
        validation.results.push({ input: item, ...result })
        return result.isValid
      })
      return validation
    }
    return { givenArray }
  }
  return resultIsValid(isArray.validate(input))
}
isArray.validate = function validateArray (input) {
  return { isValid: Array.isArray(input) && input.length > 0 }
}

export const defaultEmailOptions = { minDomainAtoms: 2 }
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

export function isPhone (input, country) {
  return resultIsValid(isPhone.validate(input, country))
}
isPhone.validate = function validatePhone (input, country) {
  const result = parsePhoneNumber(input, country)
  const isValid = !!result?.isValid()
  if (result) delete result.metadata
  return { isValid, result }
}

export function isObject (input) {
  return resultIsValid(isObject.validate(input))
}
isObject.validate = function validateObject (i) {
  return { isValid: Object.prototype.toString.call(i) === '[object Object]' }
}

export function isEmpty (input) {
  return resultIsValid(isEmpty.validate(input))
}
isEmpty.validate = function validateEmpty (input) {
  return {
    isValid: input === undefined ||
      input === null ||
      input === '' ||
      (Array.isArray(input) && input.length === 0) ||
      (isObject(input) && Object.keys(input).length === 0)
  }
}

export const canBeEmpty = isEmpty
