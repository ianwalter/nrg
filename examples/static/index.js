import nrg from '@ianwalter/nrg'

console.log('PATH', new URL('dist', import.meta.url).pathname)

export default nrg.createApp({
  static: {
    enabled: true, // Only necessary since NODE_ENV is not production.
    root: new URL('dist', import.meta.url).pathname,
    fallback (ctx) {
      ctx.body = 'I Wish I Could'
    }
  }
})
