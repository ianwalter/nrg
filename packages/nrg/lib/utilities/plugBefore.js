module.exports = function pluginBefore ($rel, plugins) {
  Object.values(plugins).map(p => Object.assign(p, { $rel, $pos: 'before' }))
  return plugins
}
