import nrgPlugin from './plugin.js'
import reactPlugin from 'vite-plugin-react'

const config = {
  jsx: 'react',
  plugins: [nrgPlugin, reactPlugin]
}

module.exports = config
