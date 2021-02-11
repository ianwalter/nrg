import { test } from '@ianwalter/bff'
import {
  isString,
  isBoolean,
  isInteger,
  isArray,
  isEmail,
  isPhone,
  isStrongPassword,
  isOptional,
  lowercase,
  trim,
  SchemaValidator,
  ignoreEmpty
} from '../index.js'

const containsSoftware = {
  validate: occupation => ({
    isValid: occupation.toLowerCase().includes('software'),
    message: 'Occupation must contain software.'
  })
}
const registrationValidator = new SchemaValidator({
  email: { isEmail, lowercase, trim },
  name: isString,
  password: { isStrongPassword, message: 'Your password must be stronger.' },
  occupation: { containsSoftware },
  phone: { isPhone, isOptional, name: 'telephone number' },
  organizationName: { isString, ignoreEmpty }
})
const email = 'yo@fastmail.com'
const validInput = {
  email: '  yo@FASTmail.com',
  name: 'Georgy Zhukov',
  password: '23-01=dwko;qwe2',
  occupation: 'Software General',
  phone: '6177779501',
  organizationName: 'Acme'
}
const args = { phone: ['US'] }

test('Valid registration', async t => {
  const validation = await registrationValidator.validate(validInput, args)
  t.expect(validation.isValid).toBe(true)
})

test('Invalid registration', async t => {
  const input = {
    email: 'hahaha',
    name: '',
    password: 'qwerty',
    occupation: 'CEO',
    phone: '777',
    organizationName: false
  }
  const validation = await registrationValidator.validate(input, args)
  t.expect(validation.isValid).toBe(false)
  t.expect(validation).toMatchSnapshot({
    validations: {
      password: {
        result: t.expect.any(Object)
      }
    }
  })
})

test('With validation data', async t => {
  const input = {
    ...validInput,
    artist: 'Peach Pit',
    song: 'Feelin Low'
  }
  const validation = await registrationValidator.validate(input, args)
  t.expect(validation.data).toEqual({ ...validInput, email })
})

test('Without optional data', async t => {
  const { phone, ...required } = validInput
  const validation = await registrationValidator.validate(required, args)
  t.expect(validation.isValid).toBe(true)
})

test('Field with ignoreEmpty', async t => {
  const input = { ...validInput, organizationName: '' }
  const validation = await registrationValidator.validate(input, args)
  t.expect(validation.isValid).toBe(true)
})

test('Nested SchemaValidator', async t => {
  const orderValidator = new SchemaValidator({
    userId: { isInteger },
    consent: { isBoolean },
    cart: new SchemaValidator({
      currency: { isString },
      products: { isArray: isArray(isString) }
    })
  })
  const validTop = { userId: 123, consent: true }
  const validCart = { currency: 'USD', products: ['widget', 'gizmo'] }

  // Test validating valid input.
  let validation = await orderValidator.validate({
    ...validTop,
    cart: validCart,
    coupon: 'FREE'
  })
  t.expect(validation.isValid).toBe(true)
  t.expect(validation.data.coupon).toBe(undefined)

  // Test validating invalid top-level input.
  validation = await orderValidator.validate({ userId: 123, cart: validCart })
  t.expect(validation.isValid).toBe(false)
  t.expect(validation.validations.userId.isValid).toBe(true)
  t.expect(validation.validations.consent.isValid).toBe(false)

  // Test validating invalid nested input.
  const invalidCart = { currency: 'GBP', products: ['widget', { qty: 1 }] }
  validation = await orderValidator.validate({ ...validTop, cart: invalidCart })
  t.expect(validation.isValid).toBe(false)
})
