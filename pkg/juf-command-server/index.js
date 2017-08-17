var _ = juf.util;
var server = require('./server.js');
var util = require('./util.js');

exports.name = 'server <command> [options]';
exports.desc = 'launch a server';
exports.options = {
  '-h, --help': 'print this help message',
  '-p, --port <int>': 'server listen port',
  '--type': 'specify server type'
};
exports.commands = {
  'start': 'start server'
};

exports.run = function(argv, cli, env) {

  // 显示帮助信息
  if (argv.h || argv.help) {
    return cli.help(exports.name, exports.options, exports.commands);
  }

  if (!validate(argv)) {
    return;
  }

  // 因为 root 被占用了，所以这里暂且允许通过 --www 来指定。
  if (argv.www) {
    argv.root = argv.www;
    delete argv.www;
  }

  // short name
  if (argv.p && !argv.port) {
    argv.port = argv.p;
    delete argv.p;
  }

  var cmd = argv._[1];
  var serverInfo = util.serverInfo() || {};
  delete argv['_'];
  var options = _.assign({
    type: serverInfo.type || 'node',

    // 每次 start 的时候，root 都需要重新指定，否则使用默认 document root.
    root: cmd === 'start' ? util.getDefaultServerRoot() : (serverInfo.root || util.getDefaultServerRoot()),

    port: 8080
  }, argv);

  // // 如果指定的是文件，则报错。
  if (juf.util.exists(options.root)) {
    if (!juf.util.isDir(options.root)) {
      juf.log.error('invalid document root `%s` is not a directory.', options.root);
    }
  } else {
    juf.util.mkdir(options.root);
  }

  options.root = juf.util.realpath(options.root);

  // // set options to server.
  server.options(options);

  switch (cmd) {
    case 'restart':
      break;

    case 'start':
    case 'stop':
    case 'info':
    case 'open':
    case 'clean':
      server[cmd].call(server);
      break;

    default:
      cli.help(exports.name, exports.options, exports.commands);
      break;
  }
};

// 占位
// 验证参数是否正确。
function validate() {
  return true;
}
