// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

import api from '../../api'

export default api(function hello (ctx) {
  ctx.body = { name: 'John Doe' }
})
