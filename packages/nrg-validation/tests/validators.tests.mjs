import { test } from '@ianwalter/bff'
import {
  isString,
  isEmail,
  isPhone,
  isDate,
  isStrongPassword
} from '../index.js'

test('isString', ({ expect }) => {
  expect(isString('Parker')).toBe(true)
  expect(isString(2018)).toBe(false)
  expect(isString({})).toBe(false)
  expect(isString([])).toBe(false)
})

test('isEmail', ({ expect }) => {
  expect(isEmail('guy@example.com')).toBe(true)
  expect(isEmail('guy@')).toBe(false)
  expect(isEmail('guy@example')).toBe(false)
})

test('isPhone', t => {
  t.expect(isPhone('617-777-9501', 'US')).toBe(true)
  t.expect(isPhone('+16177779501')).toBe(true)
  t.expect(isPhone('07011 123456', 'GB')).toBe(true)
  t.expect(isPhone('340 777 9501', 'US')).toBe(true)
  t.expect(isPhone('(787) 777-9501', 'US')).toBe(true)
  t.expect(isPhone('+1 (939) 777-9501', 'US')).toBe(true)
  t.expect(isPhone('617-777-901')).toBe(false)
  t.expect(isPhone('10711123456', 'GB')).toBe(false)
})

test('isDate', ({ expect }) => {
  expect(isDate('2019-10-21T03:13:20.796Z')).toBe(true)
  expect(isDate('209')).toBe(false)
  expect(isDate(new Date())).toBe(true)
})

test('isStrongPassword', ({ expect }) => {
  expect(isStrongPassword('fj2wfnfw93ivznjiojweQWPMNV')).toBe(true)
  expect(isStrongPassword('qwerty')).toBe(false)
})
