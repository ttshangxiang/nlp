'use strict';

let path = require('path');
let webpack = require('webpack');

let baseConfig = require('./base');
let defaultSettings = require('./defaults');

// Add needed plugins here
let config = Object.assign({}, baseConfig, {
    entry: defaultSettings.entries('dist'),
    cache: false,
    output: {
        path: path.join(__dirname, '../dist'),
        filename: './js/[name]-[chunkhash:8].js',
        publicPath: defaultSettings.publicPath
    },
    // devtool: 'sourcemap',
    devtool: false,
    plugins: baseConfig.plugins.concat([
        new webpack.optimize.DedupePlugin(),
        new webpack.DefinePlugin({
            'process.env.NODE_ENV': '"production"'
        }),
        new webpack.optimize.UglifyJsPlugin(),
        new webpack.optimize.OccurenceOrderPlugin(),
        new webpack.optimize.AggressiveMergingPlugin(),
        new webpack.NoErrorsPlugin()
    ]),
    module: defaultSettings.getDefaultModules()
});

module.exports = config;
