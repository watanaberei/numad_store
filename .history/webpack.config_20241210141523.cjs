const path = require('path');
const HtmlWebpackPlugin = require("html-webpack-plugin");
const webpack = require('webpack');

module.exports = {
  mode: 'development',
  entry: {
    main: "./src/client/main.js",
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
        },
      },
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"],
      },
      ,
      {
        test: /\.(png|svg|jpg|jpeg|gif)$/i,
        type: 'asset/resource'
      }
    ],
  },
  resolve: {
    alias: {
      Components: path.resolve(__dirname, "src/client/components"),
      Screens: path.resolve(__dirname, "src/client/screens"),
      Assets: path.resolve(__dirname, "src/client/assets")
    },
    fallback: {
      "os": false,
      "tls": false,
      "net": false,
      "path": false,
      "zlib": false,
      "http": false,
      "https": false,
      "stream": false,
      "crypto": false,
      "process": require.resolve("process/browser"),
      "querystring": require.resolve("querystring-es3")
    }
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: "./src/client/index.html",
      filename: 'index.html',
      inject: true
    }),
    new webpack.DefinePlugin({
      'process.env': JSON.stringify(process.env),
      'process.env.YELP_API_KEY': JSON.stringify(process.env.YELP_API_KEY),
      'process.env.YELP_BASE_URL': JSON.stringify(process.env.YELP_BASE_URL),
    }),
    new webpack.ProvidePlugin({
      process: 'process/browser'
    })
  ],
  output: {
    filename: "main.js",
    path: path.resolve(__dirname, "dist"),
    clean: true,
    publicPath: "/", // Ensures files are served correctly    clean: true,
  },
  devServer: {
    static: {
      directory: path.join(__dirname, 'public'),
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
    hot: true,
    open: true,
    historyApiFallback: true, // Handles SPA routing
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, PATCH, OPTIONS",
      "Access-Control-Allow-Headers": "X-Requested-With, content-type, Authorization"
    },
    // static: {
    //   directory: path.resolve(__dirname, "dist"),
    // },
    compress: true,
    port: 3000,
  },
};