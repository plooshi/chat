var path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CssoWebpackPlugin = require('csso-webpack-plugin').default;
const TerserPlugin = require('terser-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

var htmlMinOpts = {
  removeComments: true,
  collapseWhitespace: true,
  removeRedundantAttributes: true,
  useShortDoctype: true,
  removeEmptyAttributes: true,
  removeStyleLinkTypeAttributes: true,
  keepClosingSlash: true,
  minifyJS: true,
  minifyCSS: true,
  minifyURLs: true,
};

module.exports = {
  mode: 'production',
  entry: {
    'socket.io': './dev/socket.io.js',
    chat: './dev/chat.js',
    user: './dev/user.js',
    online: './dev/online.js'
  },
  output: {
    path: path.resolve(__dirname, 'prod'),
    filename: '[name].[contenthash:8].js',
    assetModuleFilename: '[name].[contenthash:8][ext]'
  },
  plugins: [
    new CleanWebpackPlugin(),
    new CssoWebpackPlugin(),
    new MiniCssExtractPlugin({
      filename: '[name].[contenthash:8].css'
    }),
    new HtmlWebpackPlugin(
      Object.assign(
        {

        },
        {
          inject: true,
          template: "dev/index.html",
        },
        {
          minify: htmlMinOpts,
        }
      )
    ),
    new HtmlWebpackPlugin(
      Object.assign(
        {

        },
        {
          inject: false,
          template: "dev/chat.html",
          filename: 'chat.html'
        },
        {
          minify: htmlMinOpts,
        }
      )
    )
  ],
    module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
        options: {
          presets: ['@babel/preset-env']
        }
      },
      {
        test: /\.css$/,
        use: [
          MiniCssExtractPlugin.loader,
          'css-loader'
        ],
        sideEffects: true
      }
    ]
  },
  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        extractComments: true,
      })
    ],
  },
};