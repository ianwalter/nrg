import { test } from '@ianwalter/bff'
import {
  isString,
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
  name: { isString },
  password: { isStrongPassword, message: 'Your password must be stronger.' },
  occupation: { containsSoftware },
  phone: { isPhone, isOptional, name: 'telephone number' },
  nickname: { isString, ignoreEmpty }
})
const email = 'yo@fastmail.com'
const validInput = {
  email: '  yo@FASTmail.com',
  name: 'Georgy Zhukov',
  password: '23-01=dwko;qwe2',
  occupation: 'Software General',
  phone: '6177779501'
}
const args = { phone: ['US'] }

test('valid registration', async t => {
  const validation = await registrationValidator.validate(validInput, args)
  t.expect(validation.isValid).toBe(true)
})

test('invalid registration', async t => {
  const input = {
    email: 'hahaha',
    name: '',
    password: 'qwerty',
    occupation: 'CEO',
    phone: '777'
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

test('validaion data', async t => {
  const input = {
    ...validInput,
    artist: 'Peach Pit',
    song: 'Feelin Low'
  }
  const validation = await registrationValidator.validate(input, args)
  t.expect(validation.data).toEqual({ ...validInput, email })
})

test('without optional data', async t => {
  const { phone, ...required } = validInput
  const validation = await registrationValidator.validate(required, args)
  t.expect(validation.isValid).toBe(true)
})

test('ignoreEmpty', async t => {
  const input = { ...validInput, nickname: '' }
  const validation = await registrationValidator.validate(input, args)
  t.expect(validation.isValid).toBe(true)
})
