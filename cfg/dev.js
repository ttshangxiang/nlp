'use strict';

let webpack = require('webpack');
let baseConfig = require('./base');
let defaultSettings = require('./defaults');

// Add needed plugins here

let config = Object.assign({}, baseConfig, {
    entry: defaultSettings.entries('dev'),
    cache: true,
    // devtool: 'eval-source-map',
    devtool: '#source-map',
    plugins: baseConfig.plugins.concat([
        new webpack.HotModuleReplacementPlugin(),
        new webpack.NoErrorsPlugin()
    ]),
    module: defaultSettings.getDefaultModules()
});

module.exports = config;
