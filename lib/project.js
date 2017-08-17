'use strict';
var _ = require('./util.js');
var glob = require('glob');
var path = require('path');

/**
 * juf 项目相关
 * @namespace juf.project
 */

//paths
var PROJECT_ROOT;
var TEMP_ROOT;

/*
 * 返回由 root 和 args 拼接成的标准路径。
 * @param  {String} root rootPath
 * @param  {String|Array} args 后续路径
 * @return {String}      标准路径格式
 * @example
 *   getPath('/Users/', ['apple', '/someone/', '/Destop/']) === getPath('/Users/', 'apple/someone//Destop/')
 *   /Users/apple/someone/Destop
 */
function getPath(root, args) {
  if (args && args.length > 0) {
    args = root + '/' + Array.prototype.join.call(args, '/');
    return juf.util(args);
  } else {
    return juf.util(root);
  }
}

/*
 * 初始化文件夹
 * @param  {String} path  文件夹路径
 * @param  {String} title
 * @return {String}       若文件夹已存在返回其觉得对路径，若不存在新建病返回绝对路径，若为文件则打印错误信息，返回path绝对路径
 */
function initDir(path, title) {
  if (juf.util.exists(path)) {
    if (!juf.util.isDir(path)) {
      juf.log.error('unable to set path[%s] as %s directory.', path, title);
    }
  } else {
    juf.util.mkdir(path);
  }
  path = juf.util.realpath(path);
  if (path) {
    return path;
  } else {
    juf.log.error('unable to create dir [%s] for %s directory.', path, title);
  }
}

/**
 * 获取项目所在目录。
 * 注意：返回的文件路径，已经被 normalize 了。
 * @param {String} [subpath] 如果指定了子目录，将返回子目录路径。
 * @return {String}
 * @function
 * @memberOf juf.project
 * @name getProjectPath
 */
exports.getProjectPath = function() {
  if (PROJECT_ROOT) {
    return getPath(PROJECT_ROOT, arguments);
  } else {
    juf.log.error('undefined project root');
  }
};

/**
 * 设置项目根目录
 * @param {String} path 项目根目录
 * @function
 * @memberOf juf.project
 * @name setProjectRoot
 */
exports.setProjectRoot = function(path) {
  if (juf.util.isDir(path)) {
    PROJECT_ROOT = juf.util.realpath(path);
  } else {
    juf.log.error('invalid project root path [%s]', path);
  }
};

/**
 * 设置并创建临时文件夹
 * @param {String} tmp 临时文件夹路径
 * @function
 * @memberOf juf.project
 * @name setTempRoot
 */
exports.setTempRoot = function(tmp) {
  TEMP_ROOT = initDir(tmp);
};

/**
 * 获取临时文件夹根目录，若未手动设置，则遍历用户环境变量中['JUF_TEMP_DIR', 'LOCALAPPDATA', 'APPDATA', 'HOME']这几项是否有设置，有则作为临时目录path，没有则以juf/.juf-tmp作为临时文件夹
 * @function
 * @memberOf juf.project
 * @name getTempRoot
 */
exports.getTempRoot = function() {
  if (!TEMP_ROOT) {
    var list = ['JUF_TEMP_DIR', 'LOCALAPPDATA', 'APPDATA', 'HOME'];
    var name = juf.cli && juf.cli.name ? juf.cli.name : 'juf';
    var tmp;
    for (var i = 0, len = list.length; i < len; i++) {
      if ((tmp = process.env[list[i]])) {
        break;
      }
    }
    tmp = tmp || __dirname + '/../';
    exports.setTempRoot(tmp + '/.' + name + '-tmp');
  }
  return TEMP_ROOT;
};

/**
 * 获取临时文件夹路径
 * @return {String}
 * @function
 * @memberOf juf.project
 * @name getTempPath
 */
exports.getTempPath = function() {
  return getPath(exports.getTempRoot(), arguments);
};

/**
 * 获取对应缓存的文件路径，缓存存放在 TEMP_ROOT/cache 下
 * @return {String} 对应缓存的路径
 * @function
 * @memberOf juf.project
 * @name getCachePath
 */
exports.getCachePath = function() {
  return getPath(exports.getTempPath('cache'), arguments);
};