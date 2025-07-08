//'./src/server/webpack.config.cjs'
const path = require('path');
const HtmlWebpackPlugin = require("html-webpack-plugin");
const webpack = require('webpack');

module.exports = {
  mode: 'development',
  entry: "./src/client/index.js",
  devtool: 'inline-source-map',
  module: {
    rules: [
      {
        test: /server\/.+\.js$/,
        // use: 'null-loader',
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env']
          }
        }
      },
      {
        test: /\.css$/, 
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /\.(png|svg|jpg|jpeg|gif)$/i,
        type: 'asset/resource',
      },
    ]
  },
  resolve: {
    alias: {
      Components: path.resolve(__dirname, "src/client/components"),
      Screens: path.resolve(__dirname, "src/client/screens"),
      Assets: path.resolve(__dirname, "src/client/assets"),
      // Redirect server imports to empty modules for client
      '../server': false,
      '../../server': false,
      '../../../server': false,
    },
    fallback: {
      "os": false,
      "vm": false,
      "process/browser": require.resolve("process/browser"),
      "process": require.resolve("process/browser"),
      "http": require.resolve("stream-http"),
      "crypto": require.resolve("crypto-browserify"),
      "stream": require.resolve("stream-browserify"),
      "zlib": require.resolve("browserify-zlib"),
      "net": false,
      "async_hooks": false,
      "querystring": require.resolve("querystring-es3"),
      "fs": false,
      "path": false,
      "mongoose": false,
      "https": require.resolve("https-browserify"),
      "buffer": require.resolve("buffer/"),
      "util": require.resolve("util/")
    }
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './src/client/index.html',
      filename: 'index.html',
      inject: true,
    }),
    new webpack.DefinePlugin({
      'process.env': JSON.stringify(process.env),
      'process.env.SERVER_URL': JSON.stringify(process.env.SERVER_URL || 'http://localhost:4500'),
      'process.env.AUTHSERVER_URL': JSON.stringify(process.env.AUTHSERVER_URL || 'http://localhost:4000')
    }),
    new webpack.ProvidePlugin({
      process: 'process/browser'
    })
  ],
  output: {
    filename: "main.js",
    path: path.resolve(__dirname, 'dist'),
    clean: true,
    publicPath: '/',
  },
  devServer: {
    hot: true,
    static: {
      directory: path.resolve(__dirname, "dist"),
    },
    compress: true,
    port: 3000,
    open: true,
    historyApiFallback: true,
  },
};