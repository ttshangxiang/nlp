var config = {
    // 数据库配置
    mysql: {
        host: '159.1.66.237',
        user: 'nlp',
        password: 'haizhi',
        database: 'nlp',
        port: 3306
    },
    // 第三方登录地址
    loginUrl: 'http://159.1.66.50:8081/Portal/SyncSession/index.do?sysCode=hzNLP&targetUrl=',
    // 第三方获取登录状态地址
    checkUrl: 'http://159.1.66.50:8081/Portal/api/auth.do?authToken='
};

module.exports = config;