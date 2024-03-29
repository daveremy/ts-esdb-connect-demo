const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
  mode: 'development', // Change to 'production' when ready for production builds
  entry: './src/client/ts/dashboard.ts', // Entry point for your application
  output: {
    filename: 'bundle.js', // The name of the output bundle
    path: path.resolve(__dirname, 'dist/client'), // Output directory
    clean: true, // Clean the output directory before each build
  },
  module: {
    rules: [
      {
        test: /\.ts$/, // Apply this rule to TypeScript files
        use: {
          loader: 'ts-loader',
          options: {
            configFile: path.resolve(__dirname, 'tsconfig.client.json')
          }
        },
        exclude: /node_modules/, // Don't transpile files from node_modules
      },
    ],
  },
  resolve: {
    extensions: ['.ts', '.js'], // Automatically resolve these file extensions
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './src/client/public/index.html', // Path to your template HTML file
      filename: 'index.html', // Name of the output HTML file
      inject: 'body', // Injects the script tag at the end of the body
    }),
    new CopyWebpackPlugin({
      patterns: [
        {
          from: path.resolve(__dirname, 'src/client/public'), // Source directory
          to: path.resolve(__dirname, 'dist/client'), // Destination directory
          globOptions: {
            ignore: ['**/index.html'], // Ignore index.html since HtmlWebpackPlugin is handling it
          },
        },
      ],
    }),
  ],
  devServer: {
    static: {
      directory: path.resolve(__dirname, 'dist/client'), // Serve content from the output directory
    },
    watchFiles: ['src/client/ts/**/*', 'src/client/public/**/*'],
    compress: true, // Enable gzip compression
    open: true, // Open the default browser after the server starts
    hot: true, // Enable Hot Module Replacement
    historyApiFallback: true, // Serve index.html for all routes to support SPA routing
  },
  devtool: 'source-map', // Generate source maps for better error messages
};
