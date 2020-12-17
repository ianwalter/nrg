export function trim (data) {
  return data && trim.modify(data)
}
trim.modify = function modfiy (data) {
  return data.trim()
}

export function lowercase (data) {
  return data && lowercase.modify(data)
}
lowercase.modify = function modify (data) {
  return data.toLowerCase()
}
