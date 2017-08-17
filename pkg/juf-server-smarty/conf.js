var static = 'assets';
var template = 'views';
var test = 'test';
var map = 'map';
var devTemplate = 'themes';
var devStatic = 'static';

var config = {
    tplIgnore: ['!gulp/**', '!mock/**/*.tpl', '!test/**', '!node_modules/**', '!package.json', '!juf-conf.js', '!gulp-conf.js', '!gulpfile.js', '!server.config.js', '!rewrite.conf'],
    staticIgnore: ['!**/*.tpl', '!gulp/**', '!mock/**', '!test/**', '!node_modules/**', '!package.json', '!juf-conf.js', '!gulp-conf.js', '!gulpfile.js', '!server.config.js', '!rewrite.conf'],
    default: {
        tpl: {
            src: '**/*.tpl',
            deploy: template,
            useDir: false
        },
        test: {
            src: 'test/**/*.json',
            deploy: test
        },
        js: {
            src: '**/*.js',
            deploy: static,
            useDir: true
        },
        less: {
            src: '**/*.less',
            deploy: static,
            useDir: true
        },
        png: {
            src: '**/*.{png,jpg,jpeg,gif,eot,svg,ttf,woff,woff2}',
            deploy: static,
            useDir: true
        },
        map: map,
        conf: {
            src: 'rewrite.conf',
            deploy: 'server-conf'
        }
    },
    dev: {
       tpl: {
            src: '**/*.tpl',
            deploy: devTemplate,
            useDir: false
        },
        js: {
            src: '**/*.js',
            deploy: devStatic,
            useDir: true
        },
        less: {
            src: '**/*.less',
            deploy: devStatic,
            useDir: true
        },
        png: {
            src: '**/*.{png,jpg,jpeg,gif,eot,svg,ttf,woff,woff2}',
            deploy: devStatic,
            useDir: true
        },
        map: map
    }
};

module.exports = config;