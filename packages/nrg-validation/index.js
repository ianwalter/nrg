import SchemaValidator from './lib/SchemaValidator.js'
import {
  isString,
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
  isEmail,
  isPhone,
  isDate,
  isStrongPassword
}

export const isOptional = true
