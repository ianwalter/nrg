module.exports = function swap (list, map) {
  const newList = list.slice(0)
  for (const [key, middleware] of Object.entries(map)) {
    const index = newList.findIndex(f => f.name === key)
    if (index) newList[index] = middleware
  }
  return newList
}
