module.exports = function pluginAfter ($rel, plugins) {
  Object.values(plugins).map(p => Object.assign(p, { $rel, $pos: 'after' }))
  return plugins
}
