import path from 'path'
import { createApp, serveSsr } from '@ianwalter/nrg'

const app = await createApp({
  log: { level: 'debug' },
  static: {
    root: path.join(__dirname, 'dist')
  },
  webpack: {
    configPath: path.join(__dirname, 'webpack.config.js')
  }
})

app.use(serveSsr)

// Export the app if required, otherwise start the server.
if (require.main) {
  app.serve()
} else {
  export default app
}
