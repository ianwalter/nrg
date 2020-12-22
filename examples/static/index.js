import { createApp } from '@ianwalter/nrg'

export const app = await createApp({
  static: {
    enabled: true, // Only necessary since NODE_ENV is not production.
    root: 'dist',
    fallback (ctx) {
      ctx.body = 'I Wish I Could'
    }
  }
})
