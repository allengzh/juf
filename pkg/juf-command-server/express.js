var express = require('express');
var httpProxy = require('http-proxy');
var path = require('path');
var glob = require('glob');
var fs = require('fs');

var proxy = httpProxy.createProxyServer();
var app = express();

var server = {
    isLocalFile: function(path) {
        return new Promise(function(resolve, reject) {
            fs.stat(path, function(err, stats) {
                if (err) {
                    reject(err);
                } else if (stats.isFile()) {
                    resolve(path);
                }
            });
        });
    },
    readFile: function(path) {
        return new Promise(function(resolve, reject) {
            fs.readFile(path, 'utf8', function(err, rsp) {
                if (err) {
                    reject(err);
                } else {
                    resolve(rsp);
                }
            });
        });
    },
    rewriteParser: function(file) {
        var rules = [{
            type: 'php',
            from: '/*',
            to: 'http://localhost:8000/index.php',
            mime: 'text/html'
        }];


        function Ruler(reg, to) {
            return {
                type: 'local',
                from: reg,
                to: to,
                mime: 'application/json'
            }
        }

        if (!Array.isArray(file)) {
            file = [file]
        };

        file.forEach(function(file) {
            if (!fs.existsSync(file)) {
                return null;
            }

            var content = fs.readFileSync(file, 'utf-8');
            var lines = content.split(/\r\n|\n/);
            var rrule = /^(rewrite|redirect|proxy)\s+([^\s]+)\s+([^\s]+)$/i

            lines.forEach(function(line) {
                var m = rrule.exec(line);

                if (!m) {
                    return;
                }

                rules.unshift(new Ruler(new RegExp(m[2], 'i'), m[3]));
            });
        });

        return rules;
    },
    run: function(staticRoot) {
        var me = this;
        var pattern = staticRoot + '/server-conf/**/rewrite.conf';

        glob(pattern, { nodir: true }, function(err, files) {

        	var paths = [];

            if (err) {
                console.log(err);
            } else {
                paths = me.rewriteParser(files);
            }

            paths.forEach(function(item, idx, arr) {
                var method = item.method || 'all';
                var type = item.mime || 'text/plain';
                var localpath = '';

                app[method](item.from, function(req, res) {

                    if (req.params.filename) {
                        localpath = path.join(staticRoot, req.params.filename) + '.json';
                    } else if ('local' === item.type) {
                        localpath = path.join(staticRoot, item.to);
                    }

                    me.isLocalFile(localpath).catch(function() {
                            proxy.web(req, res, {
                                target: item.to
                            });
                        })
                        .then(me.readFile)
                        .then(function(resText) {
                            res.type(type);
                            res.send(resText);
                        });
                });
            });
        });

        app.use(express.static(staticRoot));

        proxy.on('error', function(e) {
            console.log('Cound not connect to proxy, please try again...');
        });

        app.listen(3000, function() {
            console.log("Express server is running on port: " + 3000);
        });
    }
};

module.exports = server;
