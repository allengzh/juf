var spawn = require('cross-spawn');
var path = require('path');
var fs = require('fs');
var cwdSpace = process.cwd();

var release = module.exports;

var projectConfig = path.join(cwdSpace, 'juf-conf.js');
var serverRoot = juf.project.getTempPath('www');

//检测文件或者文件夹存在 nodeJS
function fsExistsSync(path) {
    try {
        fs.accessSync(path, fs.F_OK);
    } catch (e) {
        return false;
    }
    return true;
}

release.run = function(options) {
    if (fsExistsSync(projectConfig)) {
        var namespace = require(projectConfig).namespace;
        var output = false;

        if(options.local){
            serverRoot = options.local;
            output = true;
        }
        console.log(serverRoot);
        var release = spawn('gulp', ['release', '--output', output, '--dest', options.dest, '--clean', options.clean, '--watch', options.watch, '--cwd', __dirname, '--dir', cwdSpace, '--root', serverRoot]);
        release.on('exit', function(code) {
            if (code !== 0) {
                juf.log.error('juf release error, error: Failed code ' + code);
            }
        });
        release.stdout.on('data', function(data) {
            if (data.toString() === 'success') {
                juf.log.success('release success! '.yellow.bold);
            } else {
                console.log(data.toString());
            }
        });
    } else {
        juf.log.error('juf-conf.js is not found!');
    }
}
