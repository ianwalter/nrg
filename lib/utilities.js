/**
 * This is a simple utility method to allow you to get a subset of data
 * properties from a given object / model instance. An example of when it's
 * useful would be when you've fetched a whole user account but only want to
 * send "public" data in a response (e.g. without the password).
 */
function extract (source, properties) {
  const toObject = (acc, key) => {
    acc[key] = source[key]
    return acc
  }
  return properties.reduce(toObject, {})
}

function swap (list, map) {
  const newList = list.slice(0)
  for (const [key, middleware] of Object.entries(map)) {
    const index = newList.findIndex(f => f.name === key)
    if (index) {
      newList[index] = middleware
    }
  }
  return newList
}

const getRandomTimeout = (max = 2000, min = 500) => Math.max(
  Math.floor(Math.random() * Math.floor(max)),
  min
)

module.exports = { extract, swap, getRandomTimeout }
