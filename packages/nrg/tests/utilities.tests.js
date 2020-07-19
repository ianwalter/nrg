const { test } = require('@ianwalter/bff')
const { account, swap } = require('..')

test('Swapping out middleware', t => {
  const getAccount = () => 'Here you go!'
  t.expect(swap(account, { getAccount })).toContain(getAccount)
})
