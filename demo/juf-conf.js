var fs = require('fs');
var namespace = 'demo';
var config = {
    namespace: namespace,
    type: 'smarty',
    gzh: {
        root: '/data/wwwroot/gzh.juhe.cn',
        sshConfig: {
            host: '10.0.10.116',
            port: 22,
            username: 'root',
            privateKey: fs.readFileSync('C:/Users/Administrator/.ssh/id_rsa_2048')
        }
    }
};

module.exports = config;