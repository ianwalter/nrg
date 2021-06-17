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

export function toUrl (input) {
  return input && toUrl.modify(input)
}
toUrl.modify = function modify (input) {
  let url = input
  try {
    url = new URL(input).href
  } catch (err) {
    // Ignore error.
  }
  return url
}
