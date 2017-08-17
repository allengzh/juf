var spawn = require('cross-spawn');
var path = require('path');
var tar = require('tar');
var fs = require('fs');
var config = require('./conf.js');
var util = require('../juf-command-server/util.js');

exports.start = function(opt, callback) {

    process.stdout.write('starting juf-server .');

    function open() {
        var server = spawn('gulp', ['server', '-p', opt.port, '--root', opt.root, '--cwd', __dirname]);
        server.on('exit', function(code) {
            if (code !== 0) {
                process.stdout.write('\n');
                juf.log.error('juf-server fails to start at port [' + opt.port + '], error: Failed code ' + code);
            }
        });
        server.stdout.on('data', function(data) {

            if(data.toString() === 'success'){
                var protocol = 'http';
                var address = protocol + '://127.0.0.1' + (opt.port == 80 ? '/' : ':' + opt.port + '/');

                process.stdout.write('.');
                process.stdout.write(' at port [' + opt.port + ']\n');
                juf.log.success('Browse '.yellow.bold + address);
                juf.log.success('Or browse '.yellow.bold + protocol + '://' + util.hostname + (opt.port == 80 ? '/' : ':' + opt.port + '/'));
            }
        });
    }

    function extract(src, folder, callback) {
        fs
            .createReadStream(src)
            .pipe(tar.Extract({
                path: folder
            }))
            .on('error', function(err) {
                if (callback) {
                    callback(err);
                } else {
                    juf.log.error('extract tar file [%s] fail, error [%s]', tmp, err);
                }
            })
            .on('end', function() {
                callback && callback(null, src, folder);
            });
    }

    juf.config = config;
    juf.config.domain = opt.root;

    // console.log(juf.config);

    var indexPHP = path.join(opt.root, 'index.php');
    if (!juf.util.exists(indexPHP)) {
        extract(path.join(__dirname, 'blade.tar'), opt.root, open);
    } else {
        setTimeout(open, 200);
    }
};
