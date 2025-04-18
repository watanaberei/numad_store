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
  resolve: {
    extensions: ['.js', '.jsx', '.json'],
    fallback: {
      "process": require.resolve("process/browser.js"),
      "zlib": require.resolve("browserify-zlib"),
      "stream": require.resolve("stream-browserify"),
      "util": require.resolve("util/"),
      "buffer": require.resolve("buffer/"),
      "asset": require.resolve("assert/"),
      "http": require.resolve("stream-http"),
      "crypto": require.resolve("crypto-browserify"),
      "querystring": require.resolve("querystring-es3"),
      "path": false,
      "fs": false
    }
  },
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
      process: 'process/browser.js',
      Buffer: ['buffer', 'Buffer']
    }),
    new webpack.DefinePlugin({
      'process.env': JSON.stringify(process.env)
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
    proxy: {
      '/api': {
        target: 'http://localhost:4500',
        secure: false,
        changeOrigin: true
      },
      '/ws': {
        target: 'ws://localhost:4500',
        ws: true
      }
    }
  },
  output: {
    filename: '[name].bundle.js',
    path: path.resolve(__dirname, 'dist'),
    clean: true,
    publicPath: '/'
  }
};
