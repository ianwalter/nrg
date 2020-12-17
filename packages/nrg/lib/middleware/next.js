export async function adaptNext (ctx, next) {
  await next()
  if (ctx.req.next) {
    ctx.respond = false
    ctx.res.next = await ctx.req.next(ctx)
  }
}
