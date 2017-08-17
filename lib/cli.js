/**
 * 命令行相关的信息和工具类方法暴露在此模块中。
 * @namespace juf.cli
 */
var cli = module.exports = {};

var path = require('path');
var _ = require('./util.js');
var util = require('util');
require('colors');

/**
 * 命令行工具名字
 * @memberOf juf.cli
 * @name name
 * @defaultValue juf
 */
cli.name = 'juf';

//commander object
cli.commander = null;

/**
 * package.json 中的信息
 * @memberOf juf.cli
 * @name info
 */
cli.info = require(path.dirname(__dirname) + '/package.json');

/**
 * 显示帮助信息，主要用来格式化信息，处理缩进等。juf command 插件，可以用此方法来输出帮助信息。
 *
 * @param  {String} [cmdName]  命令名称
 * @param  {Object} [options]  配置
 * @param  {Array} [commands] 支持的命令集合
 * @memberOf juf.cli
 * @name help
 * @function
 */
cli.help = function(cmdName, options, commands) {
    var strs = [
        '',
        ' Usage: ' + cli.name + ' ' + (cmdName ? cmdName : '<command>')
    ];

    if (!cmdName) {
        commands = {
            'release': 'build and deploy your project',
            'server <command> [options] ': 'launch a server'
        };

        options = {
            '-h, --help': 'print this help message',
            '-v, --version': 'print product version and exit'
        };
    }

    options = options || {};
    commands = commands || {};
    var optionsKeys = Object.keys(options);
    var commandsKeys = Object.keys(commands);
    var maxWidth;

    if (commandsKeys.length) {
        maxWidth = commandsKeys.reduce(function(prev, curr) {
            return curr.length > prev ? curr.length : prev;
        }, 0) + 4;

        strs.push(null, ' Commands:', null);

        commandsKeys.forEach(function(key) {
            strs.push(util.format('   %s %s', _.pad(key, maxWidth), commands[key]));
        });
    }

    if (optionsKeys.length) {
        maxWidth = optionsKeys.reduce(function(prev, curr) {
            return curr.length > prev ? curr.length : prev;
        }, 0) + 4;

        strs.push(null, ' Options:', null);

        optionsKeys.forEach(function(key) {
            strs.push(util.format('   %s %s', _.pad(key, maxWidth), options[key]));
        });

        strs.push(null);
    }

    console.log(strs.join('\n'));
};

/**
 * 输出 juf 版本信息。
 *
 * ```
 * v1.0.0
 *
 *       /\\\\\\\\\\\  /\\\        /\\\  /\\\\\\\\\\\\\\\         
 *      \/////\\\///  \/\\\       \/\\\ \/\\\///////////         
 *           \/\\\     \/\\\       \/\\\ \/\\\                   
 *            \/\\\     \/\\\       \/\\\ \/\\\\\\\\\\\          
 *             \/\\\     \/\\\       \/\\\ \/\\\///////          
 *              \/\\\     \/\\\       \/\\\ \/\\\                
 *        /\\\   \/\\\     \//\\\      /\\\  \/\\\               
 *        \//\\\\\\\\\       \///\\\\\\\\\/   \/\\\              
 *          \/////////          \/////////     \///              
 * ```
 *
 * @memberOf juf.cli
 * @name version
 * @function
 */
cli.version = function() {
    var content = ['',
        '  v' + cli.info.version,
        ''
    ].join('\n');

    var logo;

    if (juf.util.isWin()) {
        logo = [
            '_____' + '/\\\\\\\\\\\\\\\\\\\\\\'.bold.red + '__' + '/\\\\\\'.bold.yellow + '________' + '/\\\\\\'.bold.yellow + '___' + '/\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\'.bold.green + '_',
            ' _____' + '\\/////\\\\\\///'.bold.red + '__' + '\\/\\\\\\'.bold.yellow + '_______' + '\\/\\\\\\'.bold.yellow + '__' + '\\/\\\\\\///////////'.bold.green + '_',
            '  _________' + '\\/\\\\\\'.bold.red + '_____' + '\\/\\\\\\'.bold.yellow + '_______' + '\\/\\\\\\'.bold.yellow + '__' + '\\/\\\\\\'.bold.green + '____________',
            '   _________' + '\\/\\\\\\'.bold.red + '_____' + '\\/\\\\\\'.bold.yellow + '_______' + '\\/\\\\\\'.bold.yellow + '__' + '\\/\\\\\\\\\\\\\\\\\\\\\\'.bold.green + '____',
            '    _________' + '\\/\\\\\\'.bold.red + '_____' + '\\/\\\\\\'.bold.yellow + '_______' + '\\/\\\\\\'.bold.yellow + '__' + '\\/\\\\\\///////'.bold.green + '_____',
            '     _________' + '\\/\\\\\\'.bold.red + '_____' + '\\/\\\\\\'.bold.yellow + '_______' + '\\/\\\\\\'.bold.yellow + '__' + '\\/\\\\\\'.bold.green + '____________',
            '      __' + '/\\\\\\'.bold.red + '___' + '\\/\\\\\\'.bold.red + '_____' + '\\//\\\\\\'.bold.yellow + '______' + '/\\\\\\'.bold.yellow + '___' + '\\/\\\\\\'.bold.green + '____________',
            '       _' + '\\//\\\\\\\\\\\\\\\\\\'.bold.red + '_______' + '\\///\\\\\\\\\\\\\\\\\\/'.bold.yellow + '____' + '\\/\\\\\\'.bold.green + '____________',
            '         _' + '\\/////////'.bold.red + '__________' + '\\/////////'.bold.yellow + '______' + '\\///'.bold.green + '_____________',
            ''
        ].join('\n');
    } else {
        logo = [
            '      /\\\\\\\\\\\\\\\\\\\\\\__/\\\\\\________/\\\\\\___/\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\   ',
            '      \\/////\\\\\\///__\\/\\\\\\_______\\/\\\\\\__\\/\\\\\\///////////        ',
            '           \\/\\\\\\_____\\/\\\\\\_______\\/\\\\\\__\\/\\\\\\  ',
            '            \\/\\\\\\_____\\/\\\\\\_______\\/\\\\\\__\\/\\\\\\\\\\\\\\\\\\\\\\              ',
            '             \\/\\\\\\_____\\/\\\\\\_______\\/\\\\\\__\\/\\\\\\///////          ',
            '              \\/\\\\\\_____\\/\\\\\\_______\\/\\\\\\__\\/\\\\\\      ',
            '        /\\\\\\___\\/\\\\\\_____\\//\\\\\\______/\\\\\\___\\/\\\\\\  ',
            '        \\//\\\\\\\\\\\\\\\\\\_______\\///\\\\\\\\\\\\\\\\\\/____\\/\\\\\\   ',
            '          \\/////////__________\\/////////______\\///     ',
            ''
        ].join('\n');
    }
    console.log(content + '\n' + logo);
};

/**
 * juf命令行执行入口。
 * @param  {Array} argv 由 {@link https://github.com/substack/minimist minimist} 解析得到的 argv, 已经转换成了对象。
 * @param  {Array} env  liftoff env
 * @name run
 * @memberOf juf.cli
 * @function
 */
cli.run = function(argv, env) {
    var cmdName = argv._[0];

    juf.project.setProjectRoot(env.cwd);

    env.configPath = env.configPath || argv.f || argv.file;

    if (env.configPath) {
        try {
            require(env.configPath);
        } catch (e) {
            if (~['release', 'inspect'].indexOf(cmdName)) {
                juf.log.error('Load error: \n'+env.configPath+'\n'+e.message+'\n'+e.stack);
            } else {
                juf.log.warn('Load error: '+env.configPath+'\n'+e.message);
            }
        }
    }

    if (!argv._.length) {
        cli[argv.v || argv.version ? 'version' : 'help']();
    } else {
        //register command
        var commander = cli.commander = require('commander');
        var pkg = '../pkg/juf-command-' + cmdName;
        var cmd = require(pkg);

        cmd.run(argv, cli, env);
    }
};
