var release = require('./release.js');

exports.name = 'release [media name]';
exports.desc = 'build and deploy your project';
exports.options = {
    '-h, --help': 'print this help message',
    '-d, --dest <path>': 'release output destination',
    '-l, --local': 'deploy dev',
    '-w, --watch': 'monitor the changes of project',
    '-c, --clean': 'clean compile cache',
    '-f, --file <filename>': 'specify the file path of `juf-conf.js`'
};

exports.run = function(argv, cli, env) {

    // 显示帮助信息
    if (argv.h || argv.help) {
        return cli.help(exports.name, exports.options);
    }

    // normalize options
    var options = {
        dest: argv.dest || argv.d || 'default',
        watch: !!(argv.watch || argv.w),
        clean: !!(argv.clean || argv.c),
        local: argv.local || argv.l,
    };

    release.run(options, juf.config);
};
