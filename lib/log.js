require('colors');

exports.error = function(msg) {
    console.log(('[ERROR] ' + msg).red)
}

exports.warn = function(msg) {
    console.log(('[WARN] ' + msg).yellow)
}

exports.success = function(msg) {
  console.log(('[SUCCESS] ' + msg).green)
}

exports.debug = function(msg) {
  console.log(('[DEBUG] ' + msg).blue)
}

exports.info = function(msg) {
  console.log(('[INFO] ' + msg).white)
}