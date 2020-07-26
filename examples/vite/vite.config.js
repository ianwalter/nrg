const nrgPlugin = require('./plugin')
const reactPlugin = require('vite-plugin-react')

const config = {
  jsx: 'react',
  plugins: [nrgPlugin, reactPlugin]
}

module.exports = config
