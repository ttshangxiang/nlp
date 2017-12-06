
var request = require('request');
var config = require('../deploy_conf/config')

// 用户列表
var delay = 30 * 60 * 1000;

var setCookie = function (res, nlp_access_token) {
    res.cookie('nlp_access_token', nlp_access_token, {
        maxAge: delay,
        path: '/',
        httpOnly: true
    });
};

var checkAuth = function (req, res) {
    // 带有效cookie
    var nlp_access_token = req.cookies.nlp_access_token;
    if (nlp_access_token) {
        setCookie(res, nlp_access_token);
    }
    return false;
};

var auth = function (req, res, next) {
    if (req.path == '/' || /\/.*\.html/.test(req.path)) {
        if (checkAuth(req, res)) {
            next();
            return;
        }
        // 带authToken
        var token = req.query.authToken || req.cookies.nlp_access_token;
        if (!token) {
            fail(req, res);
            return;
        }
        var url = config.checkUrl + token;
        request(url, function (error, response, body) {
            if (error || response.statusCode != 200) {
                fail(req, res);
                return;
            }
            var info = JSON.parse(body);
            if (info.code == 'SUCCESS') {
                setCookie(res, token);
                if (req.path == '/') {
                    res.redirect('/');
                } else {
                    next();
                }
            } else {
                fail(req, res);
            }
        });
    } else if (/\/api\//.test(req.path)) {
        if (checkAuth(req, res)) {
            next();
            return;
        }
        res.status(403).send({status: 403, msg: 'Not Logged In'});
    } else {
        next();
    }
};

var fail = function (req, res) {
    res.redirect(config.loginUrl);
};

module.exports = {
    auth: auth
};
