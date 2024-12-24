//'./src/server/webpack.config.cjs'
const path = require('path');
const HtmlWebpackPlugin = require("html-webpack-plugin");
const webpack = require('webpack');

module.exports = {
  mode: 'development',
  entry: "./src/client/index.js", // Entry point set to src/index.js
  devtool: 'inline-source-map', // Source mapping
  module: {
    rules: [
      {
        test: /\.js$/,
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
    },
    fallback: {
      "process": require.resolve("process/browser"),
      "fs": false,
      "path": false,
      "http": require.resolve("stream-http"),
      "crypto": require.resolve("crypto-browserify"),
      "stream": require.resolve("stream-browserify"),
      "zlib": require.resolve("browserify-zlib"),
      "net": false, // Set to false if not used on client-side
      "async_hooks": false, // Typically a server-side module
      "querystring": require.resolve("querystring-es3"),
    },
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './src/client/index.html', // Path to your template file
      filename: 'index.html', // Output file name (placed in the output.path directory)
      inject: true, // Injects the scripts into the body by default
    }),
    new webpack.DefinePlugin({
      'process.env': JSON.stringify(process.env)
    }),
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