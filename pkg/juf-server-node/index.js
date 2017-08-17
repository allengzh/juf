var spawn = require('cross-spawn');

exports.start = function(opt, callback) {
  spawn('gulp', ['server', '-p', opt.port, '--root', opt.root]);
};