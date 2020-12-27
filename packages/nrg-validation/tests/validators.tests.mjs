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

test('isPhone', ({ expect }) => {
  expect(isPhone('617-555-5555')).toBe(true)
  expect(isPhone('6175555555')).toBe(true)
  expect(isPhone('(617) 555-5555')).toBe(true)
  expect(isPhone('617-555-555')).toBe(false)
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
