const path = require('path')
const nodeExternals = require('webpack-node-externals')

const modulesDir = path.join(__dirname, '../../node_modules')
const isProduction = process.env.NODE_ENV === 'production'

module.exports = {
  entry: { ssr: './ssr.js' },
  target: 'node',
  externals: nodeExternals({ modulesDir }),
  output: {
    libraryTarget: 'commonjs2'
  },
  mode: isProduction ? 'production' : 'development',
  resolve: {
    extensions: ['.mjs', '.js', '.svelte', '.json']
  },
  module: {
    rules: [
      { test: /\.js$/, include: __dirname, loader: 'babel-loader' },
      {
        test: /\.svelte$/,
        include: __dirname,
        loader: 'svelte-loader'
      }
    ]
  }
}
