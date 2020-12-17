import { test } from '@ianwalter/bff'
import { account, swap } from '../index.js'

test('Swapping out middleware', t => {
  const getAccount = () => 'Here you go!'
  t.expect(swap(account, { getAccount })).toContain(getAccount)
})
