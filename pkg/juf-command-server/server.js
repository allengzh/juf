var server = module.exports;
var options = server._options = {};
var util = require('./util.js');
var _ = juf.util;
// var qrcode = require('qrcode-terminal');

server.options = function(opts) {
  if (arguments.length) {
    _.assign(options, opts);
  } else {
    return options;
  }
};

server.start = function() {
  var pkg = '../juf-server-'+options.type;
  var app = require(pkg);

  util.serverInfo(options);
  app.start(options);
};

// 输出服务器配置信息。
server.info = function() {
  var serverInfo = util.serverInfo() || options;

  console.log(); // 输出个空行。
  util.printObject(serverInfo, ' ');
};

// 打开服务器根目录。
server.open = function() {
  var serverInfo = util.serverInfo() || options;

  juf.log.notice('Browse %s\n', serverInfo.root.yellow.bold);
  util.open(serverInfo.root);
};

// 清空服务器目录。
server.clean = function() {
  // var now = Date.now();
  // var serverInfo = util.serverInfo() || options;

  // process.stdout.write('\n δ '.bold.yellow);

  // try {
  //   var app = juf.require('server', options.type);
  //   if (app.clean) {
  //     app.clean(serverInfo);
  //   } else {
  //     juf.util.del(serverInfo.root, options.include || juf.get('server.clean.include'), options.exclude || juf.get('server.clean.exclude', 'server.log'));
  //   }
  // } catch (e) {
  //   juf.util.del(serverInfo.root, options.include || juf.get('server.clean.include'), options.exclude || juf.get('server.clean.exclude', 'server.log'));
  // }

  // process.stdout.write((Date.now() - now + 'ms').green.bold);
  // process.stdout.write('\n');
};
