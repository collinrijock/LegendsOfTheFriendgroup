import path from 'path';
import { fileURLToPath } from 'url';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import CopyWebpackPlugin from 'copy-webpack-plugin';
import { CleanWebpackPlugin } from 'clean-webpack-plugin';
import TerserPlugin from 'terser-webpack-plugin';
import webpack from 'webpack';
import dotenv from 'dotenv';

// Since __dirname is not available in ES modules, we create it
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from .env file at the project root
const envPath = path.resolve(__dirname, '../../.env');
const envVars = dotenv.config({ path: envPath }).parsed || {};

export default (env, argv) => {
  const isProduction = argv.mode === 'production';

  return {
    entry: './src/main.ts',
    output: {
      path: path.resolve(__dirname, 'dist'), // Keep using path.resolve
      filename: path.join('[name]', 'index.js'), // As per user's example structure
      library: "LOTFClient", // Using a specific name for the library
      libraryTarget: "umd", // As per user's suggestion
      publicPath: '/', // Keep this for SPA routing and dev server
    },
    devtool: isProduction ? false : 'eval-source-map',
    module: {
      rules: [
        {
          test: /\.ts$/,
          use: {
            loader: 'ts-loader',
            options: {
              transpileOnly: true, // Add this line
            }
          },
          exclude: /node_modules/,
        },
      ],
    },
    resolve: {
      extensions: ['.ts', '.js'],
    },
    plugins: [
      new CleanWebpackPlugin(),
      new HtmlWebpackPlugin({
        template: './index.html', // Path to your source index.html
        inject: 'body',
      }),
      new CopyWebpackPlugin({
        patterns: [
          { from: 'public/assets', to: 'assets' },
        ],
      }),
      new webpack.DefinePlugin({
        'process.env.CLIENT_ID': JSON.stringify(envVars.VITE_CLIENT_ID || process.env.VITE_CLIENT_ID),
        // Define other environment variables here if needed
      }),
    ],
    devServer: {
      static: {
        directory: path.join(__dirname, 'dist'),
      },
      compress: true,
      port: 3001, // Match the port in your root tunnel script
      hot: true,
      historyApiFallback: true, // For single-page applications
      // Setup proxy for API requests if needed during development (similar to Vite's proxy)
      // proxy: {
      //   '/.proxy/api': {
      //     target: 'http://localhost:4001', // Your backend server
      //     changeOrigin: true,
      //     secure: false,
      //     ws: true, // If you need to proxy WebSockets
      //   },
      // },
    },
    optimization: {
      minimize: isProduction,
      minimizer: [
        new TerserPlugin({
          terserOptions: {
            keep_classnames: true, // Preserve class names
            keep_fnames: true,     // Preserve function names
            compress: {
              drop_console: isProduction, // Optionally drop console logs in production
            },
            format: {
              comments: false, // Remove comments
            },
          },
          extractComments: false,
        }),
      ],
    },
  };
};