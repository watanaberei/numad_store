
//'./src/server/webpack.config.cjs'
const path = require('path');
const HtmlWebpackPlugin = require("html-webpack-plugin");
const webpack = require('webpack');

module.exports = {
  mode: 'development',
  entry: {
    main: './src/client/main.js',
  },
  devtool: 'inline-source-map',
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
      "util": require.resolve("util/"),
      "buffer": require.resolve("buffer/"),
      "asset": require.resolve("assert/"),
      "net": false,
      "async_hooks": false,
      "querystring": require.resolve("querystring-es3"),
      "os": false,
      "tls": false,
      "https": false,
    }
  },
  plugins: [
    new webpack.ProvidePlugin({
      process: 'process/browser',
      Buffer: ['buffer', 'Buffer']
    }),
    new HtmlWebpackPlugin({
      template: './src/client/index.html',
      filename: 'index.html',
      inject: true,
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
    proxy: [{
      context: ['/api'],
      target: 'node', // Ensures the build targets Node.js environment
      externals: {
          dotenv: 'commonjs dotenv', // Exclude dotenv from bundling
      },
      changeOrigin: true,
      secure: false,
      headers: {
        'Authorization': `Bearer MCJDC_QCB7cdpzWtzs1PlvrwASWyNcjcSMhLW0O52P1V9tYwZ6aTvlzys2Ylh1A939F9pAp3Qf_cXe2kQ2xAFwfPNLNUAydP5S6k_qDOufkdp203jNcu851fWSRBZ3Yx`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    }],
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, PATCH, OPTIONS",
      "Access-Control-Allow-Headers": "X-Requested-With, content-type, Authorization"
    },
    compress: true,
    port: 3000,
    open: true,
    historyApiFallback: true,
  },
};
