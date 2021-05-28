import { test } from '@ianwalter/bff'
import { trim, lowercase } from '../index.js'

test('trim', t => {
  t.expect(trim(' Cam ')).toBe('Cam')
})

test('lowercase', t => {
  t.expect(lowercase('DeForEST')).toBe('deforest')
})

test('lowercase undefined', t => {
  t.expect(lowercase()).toBe(undefined)
})
