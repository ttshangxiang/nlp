
var mysql = require('mysql');
var config = require('../deploy_conf/config');
var pool = mysql.createPool(config);

// var selectSQL = 'select * from danbao limit 10';

exports.find = function (selectSQL, callback) {
    console.log("Database ==> " + selectSQL);
    pool.getConnection(function (err, conn) {
        if (err) {
            console.log("POOL ==> " + err);
            callback('error');
            return;
        }
        conn.query(selectSQL,function(err,rows){
            conn.release();
            if (err) {
                console.log(err);
                callback('error');
                return;
            }
            callback(rows);
        });
    });
};
