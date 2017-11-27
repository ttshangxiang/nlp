var express = require('express');
var webpack = require('webpack');
var path = require('path');
var webpackDevMiddleware = require('webpack-dev-middleware');
var webpackHotMiddleware = require('webpack-hot-middleware');
var webpackDevConfig = require('./webpack.config');
var baseConfig = require('./cfg/base');
var auth = require('./back/auth');

var routes = require('./back/routes');
var app = express();

var cookieParser = require('cookie-parser');
app.use(cookieParser());
// 权限验证
// app.use(auth);

// 设置端口
var port = 3001;

// 开发环境
if (process.env.NODE_ENV === 'dev') {
    var compiler = webpack(webpackDevConfig);
    app.use(webpackDevMiddleware(compiler, baseConfig.devServer));
    app.use(webpackHotMiddleware(compiler));
    port = baseConfig.devServer.port;
}

app.use('/', routes);
app.use(express.static(path.join(__dirname, 'dist')));

var server = app.listen(port, function () {
    var host = server.address().address;
    var port = server.address().port;
    console.log('whale listening at http://%s:%s', host, port);

});