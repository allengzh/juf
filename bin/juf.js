#!/usr/bin/env node

var Liftoff = require('liftoff');
var argv = require('minimist')(process.argv.slice(2));
var path = require('path');
var cli = new Liftoff({
    name: 'juf',
    processTitle: 'juf',
    moduleName: 'juf',
    configName: 'juf-conf',

    // only js supported!
    extensions: {
        '.js': null
    }
});

cli.launch({
    cwd: argv.r || argv.root,
    configPath: argv.f || argv.file
}, function(env) {
    var juf;
    if (!env.modulePath) {
        juf = require('../');
    } else {
        juf = require(env.modulePath);
    }
    process.title = this.name + ' ' + process.argv.slice(2).join(' ') + ' [ ' + env.cwd + ' ]';
    juf.cli.name = this.name;
    juf.cli.run(argv, env);
});
