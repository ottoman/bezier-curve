var path = require('path');
var webpack = require('webpack');

module.exports = {
  devtool: 'eval',
  entry: ['./src/main'],
  output: {
    path: path.join(__dirname, 'demo'),
    filename: 'bundle.js'
  },
  module: {
    loaders: [
      { test: /\.css$/, loader: 'style!css' },
      {
        test: /\.js$/,
        loaders: [
          'babel'
        ],
        include: path.join(__dirname, 'src')
      }
    ]
  }
};
