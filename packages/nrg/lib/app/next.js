export default async function next (req, res, next) {
  req.next = next
  await this.callback()(req, res)
  return res.next || res
}
