const { test } = require('@ianwalter/bff')
const { account, swap } = require('..')

test('swap', ({ expect }) => {
  const getAccount = () => 'Here you go!'
  expect(swap(account, { getAccount })).toContain(getAccount)
})
