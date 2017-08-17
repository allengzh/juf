'use strict';

/**
 * juf 名字空间，juf 中所有工具和方法都是通过此变量暴露给外部使用。
 * @namespace juf
 */
var juf = module.exports = {};

// register global variable
Object.defineProperty(global, 'juf', {
    enumerable: true,
    writable: false,
    value: juf
});

juf.log = require('./lib/log.js');

// utils
juf.util = require('./lib/util.js');

// project
juf.project = require('./lib/project.js');

juf.cli = require('./lib/cli.js');