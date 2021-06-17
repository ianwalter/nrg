import { test } from '@ianwalter/bff'
import { trim, lowercase, toUrl } from '../index.js'

test('trim', t => {
  t.expect(trim(' Cam ')).toBe('Cam')
})

test('lowercase', t => {
  t.expect(lowercase('DeForEST')).toBe('deforest')
})

test('lowercase undefined', t => {
  t.expect(lowercase()).toBe(undefined)
})

test('toUrl', t => {
  t.expect(toUrl('http:ianwalter.dev')).toBe('http://ianwalter.dev/')
  t.expect(toUrl('ianwalter')).toBe('ianwalter')
  t.expect(toUrl(undefined)).toBe(undefined)
})
