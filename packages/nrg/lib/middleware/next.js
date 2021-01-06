async function adaptNext (ctx, next) {
  await next()
  if (ctx.req.getServerSideProps) {
    ctx.respond = false
    ctx.res.serverSideProps = await ctx.req.getServerSideProps(ctx)
  }
}

module.exports = { adaptNext }
