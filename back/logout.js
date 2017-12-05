
var clear = require('./auth').clear;
module.exports = function (req, res, next) {
    var token = req.cookies.nlp_access_token;
    var str = 'Logout Success';
    console.log('logout token=' + token);
    if (token) {
        clear(token);
        res.clearCookie('nlp_access_token');
    } else {
        str = 'Not Logged In';
    }
    res.set('Content-Type', 'text/html; charset=utf-8');
    res.send(`<html><head><title>退出</title></head><body><p>${str}</p></body></html>`);
}