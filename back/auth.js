
var request = require('request');
var config = require('../deploy_conf/config')

// 用户列表
var userList = {};
var delay = 30 * 60 * 1000;

var checkAuth = function (req) {
    // 带有效cookie
    var obj = null;
    var access_token = null;
    if (req.cookies && req.cookies.nlp_access_token) {
        access_token = req.cookies.nlp_access_token;
        obj = userList[access_token];
    }
    if (obj) {
        if (new Date().getTime - obj.time < delay) {
            return true;
        } else {
            delete userList[access_token];
        }
    }
    return false;
};

var auth = function (req, res, next) {
    if (checkAuth(req)) {
        next();
        return;
    }
    if (req.path == '/' || /\/.*\.html/.test(req.path)) {
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
                userList[token] = { value: info.value, time: new Date().getTime() };
                res.cookie('nlp_access_token', token, {path: '/', httpOnly: true});
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
        res.status(403).send({status: 403, msg: 'Not Logged In'});
    } else {
        next();
    }
};

var fail = function (req, res) {
    res.redirect(config.loginUrl);
};

var clear = function (u) {
    userList[u].time = 0
}

var clearOutTime = function () {
    setInterval(function () {
        var time = new Date().getTime();
        for (var u in userList) {
            u.time && time - u.time > delay && delete userList[u];
        }
    }, 60000);
};

// 定时清理
clearOutTime();



module.exports = {
    auth: auth,
    clear: clear
};
