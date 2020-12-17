import SchemaValidator from './lib/SchemaValidator.js'
import {
  isString,
  isBoolean,
  isEmail,
  isPhone,
  isDate,
  isStrongPassword
} from './lib/validators.js'
import { trim, lowercase } from './lib/modifiers.js'

export {
  SchemaValidator,
  trim,
  lowercase,
  isString,
  isBoolean,
  isEmail,
  isPhone,
  isDate,
  isStrongPassword
}

export const isOptional = true
