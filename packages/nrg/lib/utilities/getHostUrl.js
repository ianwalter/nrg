module.exports = function getHostUrl (hostname, port) {
  return `http://${hostname}${port ? `:${port}` : ''}`
}
