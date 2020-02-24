const path = require('path')
const nodeExternals = require('webpack-node-externals')
const HtmlWebpackPlugin = require('html-webpack-plugin')

const modulesDir = path.join(__dirname, '../../node_modules')
const isProduction = process.env.NODE_ENV === 'production'

module.exports = {
  context: __dirname,
  mode: isProduction ? 'production' : 'development',
  entry: { ssr: ['./ssr.js'] },
  target: 'node',
  externals: nodeExternals({ modulesDir }),
  output: {
    libraryTarget: 'commonjs2',
    path: path.join(__dirname, 'dist')
  },
  resolve: {
    extensions: ['.mjs', '.js', '.svelte', '.json']
  },
  module: {
    rules: [
      { test: /\.js$/, include: __dirname, loader: 'babel-loader' },
      {
        test: /\.svelte$/,
        include: __dirname,
        loader: 'svelte-loader',
        options: { generate: 'ssr' }
      }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: path.join(__dirname, '../../lib/pageTemplate.html'),
      filename: 'pageTemplate.html',
      minify: false
    })
  ]
}
