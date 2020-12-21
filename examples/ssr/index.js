import path from 'path'
import { createApp, serveSsr } from '@ianwalter/nrg'

export const app = await createApp({
  log: { level: 'debug' },
  static: {
    root: path.join(__dirname, 'dist')
  },
  webpack: {
    configPath: path.join(__dirname, 'webpack.config.js')
  }
})

app.use(serveSsr)
