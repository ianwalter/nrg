module.exports = async function next (req, res, getServerSideProps) {
  req.getServerSideProps = getServerSideProps
  await this.callback()(req, res)
  return res.serverSideProps || res
}
