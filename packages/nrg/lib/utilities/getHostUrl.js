export default function getHostUrl (hostname, port) {
  return `http://${hostname}${port ? `:${port}` : ''}`
}
