import { test } from '@ianwalter/bff'
import { addDays, format } from 'date-fns'
import {
  isString,
  isBoolean,
  isInteger,
  isArray,
  isEmail,
  isPhone,
  isDate,
  isStrongPassword,
  isObject,
  isEmpty,
  isShortUsState,
  isShortUsZip,
  isDateString,
  isShortUsDobString,
  isUrl
} from '../index.js'

test('isString', t => {
  t.expect(isString('Parker')).toBe(true)
  t.expect(isString(2018)).toBe(false)
  t.expect(isString({})).toBe(false)
  t.expect(isString([])).toBe(false)
})

test('isBoolean', t => {
  t.expect(isBoolean(true)).toBe(true)
  t.expect(isBoolean('true')).toBe(false)
  t.expect(isBoolean(null)).toBe(false)
  t.expect(isBoolean(undefined)).toBe(false)
  t.expect(isBoolean('')).toBe(false)
  t.expect(isBoolean(0)).toBe(false)
  t.expect(isBoolean(1)).toBe(false)
})

test('isInteger', t => {
  t.expect(isInteger(303)).toBe(true)
  t.expect(isInteger(NaN)).toBe(false)
  t.expect(isInteger('NaN')).toBe(false)
  t.expect(isInteger('303')).toBe(false)
  t.expect(isInteger(1230450982532076)).toBe(true)
})

test('isArray', t => {
  t.expect(isArray([])).toBe(false)
  t.expect(isArray(['one'])).toBe(true)
  t.expect(isArray([1, 2])).toBe(true)
  t.expect(isArray([null])).toBe(true)
  t.expect(isArray([undefined, false])).toBe(true)
  t.expect(isArray(new Array(0))).toBe(false)
  t.expect(isArray('[1,2]')).toBe(false)
  t.expect(isArray(new Set([]))).toBe(false)
  t.expect(isArray(isInteger).givenArray([1, 2])).toBe(true)
  t.expect(isArray(isInteger).givenArray([1, '2'])).toBe(false)
})

test('isEmail', t => {
  t.expect(isEmail('guy@example.com')).toBe(true)
  t.expect(isEmail('guy@')).toBe(false)
  t.expect(isEmail('guy@example')).toBe(false)
})

test('isPhone', t => {
  t.expect(isPhone('617-777-9501', 'US')).toBe(true)
  t.expect(isPhone('+16177779501')).toBe(true)
  t.expect(isPhone('2018889999')).toBe(true)
  t.expect(isPhone('07011 123456', 'GB')).toBe(true)
  t.expect(isPhone('340 777 9501', 'US')).toBe(true)
  t.expect(isPhone('(787) 777-9501', 'US')).toBe(true)
  t.expect(isPhone('+1 (939) 777-9501', 'US')).toBe(true)
  t.expect(isPhone('617-777-901')).toBe(false)
  t.expect(isPhone('10711123456', 'GB')).toBe(false)
})

test('isDate', t => {
  t.expect(isDate('2019-10-21T03:13:20.796Z')).toBe(true)
  t.expect(isDate('209')).toBe(false)
  t.expect(isDate(new Date())).toBe(true)
})

test('isStrongPassword', t => {
  t.expect(isStrongPassword('fj2wfnfw93ivznjiojweQWPMNV')).toBe(true)
  t.expect(isStrongPassword('qwerty')).toBe(false)
})

test('isObject', t => {
  t.expect(isObject([])).toBe(false)
  t.expect(isObject({})).toBe(true)
  t.expect(isObject(null)).toBe(false)
  t.expect(isObject({ id: 1 })).toBe(true)
  t.expect(isObject('string')).toBe(false)
  t.expect(isObject(1)).toBe(false)
  t.expect(isObject(new Date())).toBe(false)
})

test('isEmpty', t => {
  t.expect(isEmpty({})).toBe(true)
  t.expect(isEmpty([])).toBe(true)
  t.expect(isEmpty(null)).toBe(true)
  t.expect(isEmpty(undefined)).toBe(true)
  t.expect(isEmpty('')).toBe(true)
  t.expect(isEmpty(' ')).toBe(false)
  t.expect(isEmpty([''])).toBe(false)
  t.expect(isEmpty({ id: undefined })).toBe(false)
  t.expect(isEmpty(0)).toBe(false)
  t.expect(isEmpty(new Date())).toBe(false)
})

test('isShortUsState', t => {
  t.expect(isShortUsState('Alabama')).toBe(false)
  t.expect(isShortUsState('AL')).toBe(true)
  t.expect(isShortUsState('NK')).toBe(false)
})

test('isShortUsZip', t => {
  t.expect(isShortUsZip('05004')).toBe(true)
  t.expect(isShortUsZip('0O422')).toBe(false)
  t.expect(isShortUsZip('1202')).toBe(false)
  t.expect(isShortUsZip('20203-3222')).toBe(false)
  t.expect(isShortUsZip('234.3')).toBe(false)
})

test('isDateString', t => {
  t.expect(isDateString('01/01/2001')).toBe(true)
  t.expect(isDateString('11/12/2051')).toBe(true)
  t.expect(isDateString('05/30/945')).toBe(true)
  t.expect(isDateString('11/32/2010')).toBe(false)
  t.expect(isDateString('00/14/2008')).toBe(false)
  t.expect(isDateString('2002-04-06')).toBe(false)
  t.expect(isDateString('2002-04-06', 'yyyy-MM-dd')).toBe(true)
})

test('isShortUsDobString', t => {
  t.expect(isShortUsDobString('01/01/2001')).toBe(true)
  t.expect(isShortUsDobString('11/12/2051')).toBe(false)
  t.expect(isShortUsDobString('05/30/1945')).toBe(true)
  t.expect(isShortUsDobString('05/30/1945', 50)).toBe(false)
  t.expect(isShortUsDobString('05/28/2021')).toBe(true)
  const today = new Date()
  t.expect(isShortUsDobString(format(today, 'MM/dd/yyyy'))).toBe(true)
  const tomorrow = addDays(today, 1)
  t.expect(isShortUsDobString(format(tomorrow, 'MM/dd/yyyy'))).toBe(false)
})

test('isUrl', t => {
  t.expect(isUrl('a')).toBe(false)
  t.expect(isUrl('http://ianwalter.dev?key=value&is=true')).toBe(true)
  t.expect(isUrl('http//ianwalter.dev')).toBe(false)
  t.expect(isUrl('http://localhost')).toBe(true)
  t.expect(isUrl('http://localhost:8080/admin')).toBe(true)
})
