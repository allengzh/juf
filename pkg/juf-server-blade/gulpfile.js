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
var connect = require('gulp-connect-php');
var express = require('express');
var path = require('path');
var httpProxy = require('http-proxy');
var fs = require('fs');
var minimist = require('minimist');
var browserSync = require('browser-sync');

var proxy = httpProxy.createProxyServer();
var app = express();
var cwdSpace = process.cwd();

var knownOptions = {
    alias: { p: 'port' },
    default: {
        port: '8080',
        root: cwdSpace,
        cwd: cwdSpace
    }
};
var options = minimist(process.argv.slice(2), knownOptions);

var server = require(options.cwd + '/../juf-command-server/express.js');

gulp.task('proxy', function(done) {
    setTimeout(function() {
        server.run(options.root);
    }, 200);

    done();
});

gulp.task('browserSync', function(done) {
    browserSync({
        proxy: 'localhost:3000',
        port: options.port,
        open: false
    });
    browserSync.watch([options.root + '/reload.conf']).on('change', function() {
        setTimeout(function() {
            browserSync.reload();
        }, 1000)
    });
    done();
});

gulp.task('phpconnect', function(done) {

    connect.server({
        base: options.root,
        port: 8000
    });
    done();
});

gulp.task('callback', function(done) {
    process.stdout.write('success');
    done();
});

gulp.task('server', gulp.series('phpconnect', 'proxy', 'browserSync', 'callback'));

module.exports = gulp;
