import { test } from '@ianwalter/bff'
import nrg from '../index.js'

test('Swapping out middleware', t => {
  const getAccount = () => 'Here you go!'
  t.expect(nrg.swap(nrg.account, { getAccount })).toContain(getAccount)
})
