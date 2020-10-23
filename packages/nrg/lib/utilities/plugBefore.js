module.exports = function plugBefore ($rel, plugins) {
  Object.values(plugins).map(p => Object.assign(p, { $rel, $pos: 'before' }))
  return plugins
}
