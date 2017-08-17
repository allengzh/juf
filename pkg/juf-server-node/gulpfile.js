/**
 * @fileOverview Gulp interger file
 * @author chenckang@gmail.com
 */
/**
 * @fileOverview Gulp server task. The main server are launched here.
 * @author 18862242813@139.com
 */

'use strict';

var gulp = require('gulp');
var express = require('express');
var path = require('path');
var httpProxy = require('http-proxy');
var fs = require('fs');
var minimist = require('minimist');
var browserSync = require('browser-sync');

var proxy = httpProxy.createProxyServer();
var app = express();
var cwdSpace = process.cwd();
var path = require('path');

var knownOptions = {
    alias: { p: 'port' },
    default: {
        port: '8080',
        root: cwdSpace
    }
};
var options = minimist(process.argv.slice(2), knownOptions);

var server = {
    run: function(config) {
        var me = this;
        app.use(express.static(options.root));

        proxy.on('error', function(e) {
            console.log('Cound not connect to proxy, please try again...');
        });

        app.listen(3000, function() {
            console.log("Express server is running on port: " + 3000);
        });
    }
};

gulp.task('proxy', function(done) {
    setTimeout(function() {
        server.run();
    }, 200);

    done();
});

gulp.task('browserSync', function(done) {
    browserSync({
        proxy: 'localhost:3000',
        port: options.port,
        open: false
    });
    done();
});

gulp.task('server', gulp.parallel('proxy', 'browserSync'));

module.exports = gulp;
