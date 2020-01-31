const { test } = require('@ianwalter/bff')
const { account, swap } = require('..')

test('Swapping out middleware', ({ expect }) => {
  const getAccount = () => 'Here you go!'
  expect(swap(account, { getAccount })).toContain(getAccount)
})
