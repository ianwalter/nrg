module.exports = function getRandomTimeout (max = 2000, min = 500) {
  return Math.max(Math.floor(Math.random() * Math.floor(max)), min)
}
