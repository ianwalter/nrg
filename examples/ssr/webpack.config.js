const path = require('path')

const isProduction = process.env.NODE_ENV === 'production'
const app = path.join(__dirname, 'app')

module.exports = {
  entry: './ssr.js',
  target: 'node',
  output: {
    libraryTarget: 'commonjs2'
  },
  mode: isProduction ? 'production' : 'development',
  resolve: {
    extensions: ['.mjs', '.js', '.svelte', '.json']
  },
  module: {
    rules: [
      { test: /\.js$/, include: app, loader: 'babel-loader' },
      {
        test: /\.svelte$/,
        include: app,
        loader: 'svelte-loader'
      }
    ]
  }
}

