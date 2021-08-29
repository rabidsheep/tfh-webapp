const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const webpack = require('webpack')

module.exports = {
  transpileDependencies: [
    'vuetify'
  ],
  configureWebpack: {
    plugins: [
      new BundleAnalyzerPlugin(),
      new webpack.IgnorePlugin({
        resourceRegExp: /^\.\/locale$/,
        contextRegExp: /moment$/
      })
    ]
  }
}
