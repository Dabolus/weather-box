/// <reference types="./typings" />
import { resolve } from 'path';
import webpack from 'webpack';
import CopyPlugin from 'copy-webpack-plugin';
import HtmlPlugin from 'html-webpack-plugin';
import ScriptExtHtmlPlugin from 'script-ext-html-webpack-plugin';
import TerserPlugin from 'terser-webpack-plugin';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import OptimizeCssAssetsPlugin from 'optimize-css-assets-webpack-plugin';

const isDev = process.env.NODE_ENV !== 'production';

const config: webpack.Configuration = {
  ...isDev ? {
    mode: 'development',
    devtool: 'eval-source-map',
    optimization: {
      removeAvailableModules: false,
      removeEmptyChunks: false,
      splitChunks: false,
    },
  } : {
    mode: 'production',
    optimization: {
      splitChunks: {
        name: false,
        cacheGroups: {
          vendor: {
            test: /node_modules/,
            chunks: 'all',
          },
        },
      },
      minimizer: [
        new TerserPlugin({
          cache: true,
          parallel: true,
          extractComments: true,
        }),
        new OptimizeCssAssetsPlugin(),
      ],
    },
  },
  cache: true,
  context: __dirname,
  entry: {
    app: './src/index',
  },
  output: {
    filename: 'scripts/[name].js',
    chunkFilename: 'scripts/[id].js',
    path: resolve(__dirname, 'dist'),
    pathinfo: false,
    crossOriginLoading: 'anonymous',
    globalObject: 'self',
  },
  resolve: {
    extensions: ['.ts', '.js', '.scss', '.css', '.ejs'],
    modules: ['src', 'node_modules'],
  },
  module: {
    rules: [
      {
        test: /\.[tj]s$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            cacheDirectory: true,
            presets: [
              ['@babel/env', {
                loose: true,
                useBuiltIns: 'usage',
                modules: false,
                corejs: 3,
              }],
              '@babel/typescript',
            ],
            plugins: [
              ['@babel/transform-runtime', {
                corejs: 3,
                sourceType: 'unambiguous',
              }],
            ],
          },
        },
      },
      {
        test: /\.s?[ac]ss$/,
        use: [
          {
            loader: MiniCssExtractPlugin.loader as string,
            options: {
              hmr: isDev,
            },
          },
          {
            loader: 'css-loader',
            options: {
              importLoaders: 2,
            },
          },
          {
            loader: 'postcss-loader',
            options: {
              ident: 'postcss',
              plugins: () => [
                require('postcss-preset-env')(),
                require('autoprefixer')(),
              ],
            },
          },
          {
            loader: 'sass-loader',
            options: {
              includePaths: ['./node_modules'],
            },
          },
        ],
      },
    ],
  },
  plugins: [
    new CopyPlugin([
      // Assets
      {
        from: resolve(__dirname, 'src/assets'),
        to: 'assets',
      },
    ]),
    new HtmlPlugin({
      inject: 'head',
      template: '!!@piuccio/ejs-compiled-loader!./src/index.ejs',
      ...isDev ? {
        showErrors: true,
      } : {
        minify: {
          collapseWhitespace: true,
          removeComments: true,
          removeRedundantAttributes: true,
          removeScriptTypeAttributes: true,
          removeStyleLinkTypeAttributes: true,
          sortAttributes: true,
          sortClassName: true,
          useShortDoctype: true,
          minifyCSS: true,
          minifyJS: true,
        },
        hash: true,
      },
    }),
    new ScriptExtHtmlPlugin({
      defaultAttribute: 'defer',
    }),
    new MiniCssExtractPlugin({
      filename: 'styles/[name].css',
      chunkFilename: 'styles/[id].css',
    }),
  ],
};

export default config;
