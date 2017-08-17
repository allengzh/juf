var _ = module.exports;

_.hostname = (function() {
  var ip = false;
  var net = require('os').networkInterfaces();

  Object.keys(net).every(function(key) {
    var detail = net[key];
    Object.keys(detail).every(function(i) {
      var address = String(detail[i].address).trim();
      if (address && /^\d+(?:\.\d+){3}$/.test(address) && address !== '127.0.0.1') {
        ip = address;
      }
      return !ip; // 找到了，则跳出循环
    });
    return !ip; // 找到了，则跳出循环
  });
  return ip || 'unknown';
})();

_.open = function(path, callback) {
  var child_process = require('child_process');
  var cmd = juf.util.escapeShellArg(path);
  if (juf.util.isWin()) {
    cmd = 'start "" ' + cmd;
  } else {
    if (process.env['XDG_SESSION_COOKIE'] ||
        process.env['XDG_CONFIG_DIRS'] ||
        process.env['XDG_CURRENT_DESKTOP']) {
      cmd = 'xdg-open ' + cmd;
    } else if (process.env['GNOME_DESKTOP_SESSION_ID']) {
      cmd = 'gnome-open ' + cmd;
    } else {
      cmd = 'open ' + cmd;
    }
  }
  child_process.exec(cmd, callback);
};

_.getDefaultServerRoot = function() {
  var key = 'juf_SERVER_DOCUMENT_ROOT';

  if (process.env && process.env[key]) {
    var path = process.env[key];

    // 如果指定的是一个文件，应该报错。
    if (juf.util.exists(path) && !juf.util.isDir(path)) {
      juf.log.error('invalid environment variable [%s] of document root [%s]', key, root);
    }

    return path;
  }

  return juf.project.getTempPath('www');
};

_.printObject = function(o, prefix) {
  prefix = prefix || '';
  for (var key in o) {
    if (o.hasOwnProperty(key)) {
      if (typeof o[key] === 'object') {
        _.printObject(o[key], prefix + key + '.');
      } else {
        console.log(prefix + key + '=' + o[key]);
      }
    }
  }
};
_.serverInfo = function(options) {
  
  var conf = _.getRCFile();
  if (arguments.length) {

    // setter
    return options && juf.util.write(conf, JSON.stringify(options, null, 2));
  } else {

    // getter
    return juf.util.isFile(conf) ? require(conf) : null;
  }
};

_.getRCFile = function() {
  return juf.project.getTempPath('server/conf.json');
};