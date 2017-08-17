/**
 * @fileOverview Gulp compiling task for build output files
 * @author 18862242813@139.com
 */

'use strict';

var gulp = require('gulp');
var cache = require('gulp-cached');
var GulpSSH = require('gulp-ssh');
var htmlmin = require('gulp-htmlmin');
var lesshint = require('gulp-lesshint');
var lessToCss = require('gulp-less');
var uncss = require('gulp-uncss');
var csso = require('gulp-csso');
var autoprefixer = require('gulp-autoprefixer');
var jshint = require('gulp-jshint');
var uglify = require('gulp-uglify');
var imagemin = require('gulp-imagemin');
var ossUpload = require('gulp-oss-upload');

var fs = require('fs');

var rev = require('./rev/gulp-rev');
var revCollector = require('./rev/gulp-rev-collector');
var spriter = require('./css-spriter');

var path = require('path');
var minimist = require('minimist');
var del = require('del');
var lodash = require('lodash');

var cwdSpace = process.cwd();

var knownOptions = {
    default: {
        dest: 'default',
        clean: false,
        output: false,
        watch: false,
        dir: cwdSpace,
        root: cwdSpace
    }
};
var options = minimist(process.argv.slice(2), knownOptions);

//检测文件或者文件夹存在 nodeJS
function fsExistsSync(path) {
    try {
        fs.accessSync(path, fs.F_OK);
    } catch (e) {
        return false;
    }
    return true;
}
var projectConfig = require(path.join(options.dir, 'juf-conf.js'));
var defaultPkg = '../juf-server-' + projectConfig.type + '/conf.js';
var defaultConfig = {};
var config = {};
var tplIgnore = [];
var staticIgnore = [];
var clean = options.clean;
var watch = options.watch;
var output = options.output;
var push = false;
var projectRoot = options.root;
var destRoot = projectRoot;
var releaseConfig;

if (clean === 'false') {
    clean = false;
}
if (clean === 'true') {
    clean = true;
}
if (watch === 'false') {
    watch = false;
}
if (watch === 'true') {
    watch = true;
}
if (output === 'true') {
    output = true;
}
if (output === 'false') {
    output = false;
}


if (fsExistsSync(defaultPkg)) {
    defaultConfig = require(defaultPkg);
} else {
    defaultConfig = {};
}

config = lodash.defaultsDeep(projectConfig, defaultConfig);

if(output){
    releaseConfig = config['dev'];
}else{
    if (config[options.dest]) {
         

        releaseConfig = lodash.defaultsDeep(config[options.dest], config['default']);

        if (releaseConfig.sshConfig) {
            destRoot = path.join(projectRoot, 'temp');
            push = true;
        }

    } else {
        releaseConfig = config['default'];
        destRoot = path.join(options.dir, options.dest);
    }
}
  

var namespace = config.namespace;
var mapDir = projectRoot + '/' + releaseConfig.map;
var mapConfig = mapDir + '/' + config.namespace + '.json';
var virtualMapDir = mapDir;
var cleanArr = [];
var tmpArr = [];
var watchArr = [];



var ossOptions = config.oss;
if (ossOptions) {
    ossOptions.rootDir = releaseConfig.png.deploy + '/' + namespace;
}



tmpArr.push(path.join(projectRoot, releaseConfig.tpl.deploy, namespace));

tmpArr.push(path.join(projectRoot, releaseConfig.js.deploy, namespace));
tmpArr.push(path.join(projectRoot, releaseConfig.less.deploy, namespace));
tmpArr.push(path.join(projectRoot, releaseConfig.png.deploy, namespace));
tmpArr.push(mapDir);

if(!output){
    tmpArr.push(path.join(projectRoot, releaseConfig.test.deploy, namespace));
    tmpArr.push(path.join(projectRoot, releaseConfig.conf.deploy));
}

watchArr.push(path.join(options.dir, releaseConfig.tpl.src));
watchArr.push(path.join(options.dir, releaseConfig.js.src));
watchArr.push(path.join(options.dir, releaseConfig.less.src));
watchArr.push(path.join(options.dir, releaseConfig.png.src));

if(!output){
    watchArr.push(path.join(options.dir, releaseConfig.test.src));
    watchArr.push(path.join(options.dir, releaseConfig.conf.src));
}

cleanArr = lodash.uniq(tmpArr, true);

config.tplIgnore.forEach(function(value) {
    tplIgnore.push('!' + options.dir + '/' + value.replace('!', ''));
});

config.staticIgnore.forEach(function(value) {
    staticIgnore.push('!' + options.dir + '/' + value.replace('!', ''));
});

gulp.task('clean', function() {
    return del(cleanArr, { force: true });
});

gulp.task('compile:html', function() {
    var tpl = releaseConfig.tpl;
    var fromArr = options.dir + '/' + tpl.src;
    var to = tpl.deploy + '/' + namespace;
    var htmlArr = [];
    var base = path.join(projectRoot, 'tmp', tpl.deploy);

    if(tpl.useDir){
        base = path.join(projectRoot, 'tmp');
    }
    htmlArr.push(fromArr);
    Array.prototype.push.apply(htmlArr, tplIgnore);

    return gulp.src(htmlArr)
        // .pipe(cache('html'))
        // .pipe(htmlmin({
        //     collapseWhitespace: true,
        //     minifyJS: true,
        //     minifyCSS: true,
        //     ignoreCustomFragments: [/<{[\s\S]*?}>/, /{{[\s\S]*?}}/, /@(if|elseif|for|foreach|forelse|while|continue|break).*[\r\n\s]*/,
        //         /@show/,
        //         /@stop/,
        //         /@parent/,
        //         /@endsection/,
        //         /@else/,
        //         /@endif/,
        //         /@endfor/,
        //         /@endforeach/,
        //         /@empty/,
        //         /@endforelse/,
        //         /@endwhile/,
        //         /@endpush/,
        //         /@[^(\r\n]*\([^)\r\n]*\)/
        //     ]
        // }))
        .pipe(rev({ hash: false }))
        .pipe(gulp.dest(path.join(projectRoot, 'tmp', to)))
        .pipe(rev.manifest(mapConfig, { base: virtualMapDir, merge: true, baseDir: base}))
        .pipe(gulp.dest(mapDir));
});

gulp.task('compile:js', function() {

    var js = releaseConfig.js;
    var from = options.dir + '/' + js.src;
    var to = js.deploy + '/' + namespace;
    var jsArr = [];
    var base = path.join(projectRoot, 'tmp', js.deploy);

    if(js.useDir){
        base = path.join(projectRoot, 'tmp');
    }

    jsArr.push(from);
    Array.prototype.push.apply(jsArr, staticIgnore);
    return gulp.src(jsArr)
        // .pipe(cache('js'))
        .pipe(jshint())
        .pipe(jshint.reporter())
        .pipe(uglify())
        .pipe(rev())
        .pipe(gulp.dest(path.join(projectRoot, 'tmp', to)))
        .pipe(rev.manifest(mapConfig, { base: virtualMapDir, merge: true, baseDir: base }))
        .pipe(gulp.dest(mapDir));
});

gulp.task('compile:less', function() {
    var less = releaseConfig.less;
    var from = options.dir + '/' + less.src;
    var to = less.deploy + '/' + namespace;
    var lessArr = [];
    var spritepng = projectRoot + '/' + releaseConfig.png.deploy + '/' + namespace + '/sprite.png';
    var base = path.join(projectRoot, 'tmp', less.deploy);

    if(less.useDir){
        base = path.join(projectRoot, 'tmp');
    }

    lessArr.push(from);
    Array.prototype.push.apply(lessArr, staticIgnore);

    return gulp.src(lessArr)
        // .pipe(cache('less'))
        .pipe(lesshint({
            // Options 
        }))
        .pipe(lesshint.reporter()) // Leave empty to use the default, "stylish" 
        // .pipe(lesshint.failOnError())
        // .pipe(uncss({
        //     html: htmlArr
        // }))
        .pipe(rev())
        .pipe(lessToCss())
        .pipe(spriter({ fromBaseDir: path.join(options.dir, ''), toBaseDir: projectRoot + '/pngTemp' }))
        .pipe(autoprefixer({
            browsers: ['last 2 version', 'safari 5', 'ie 8', 'ie 9'],
            cascade: false
        }))
        .pipe(csso())
        .pipe(gulp.dest(path.join(projectRoot, 'tmp', to)))
        .pipe(rev.manifest(mapConfig, { base: virtualMapDir, merge: true, baseDir: base }))
        .pipe(gulp.dest(mapDir));
});

gulp.task('compile:png', function(done) {
    var png = releaseConfig.png;
    var from = options.dir + '/' + png.src;
    var pngArr = [];

    pngArr.push(from);
    Array.prototype.push.apply(pngArr, staticIgnore);

    return gulp.src(pngArr)
        .pipe(gulp.dest(path.join(projectRoot, 'pngTemp')))
});

gulp.task('compile:pngTemp', function() {
    var png = releaseConfig.png;
    var from = projectRoot + '/pngTemp/**';
    var to = png.deploy + '/' + namespace;
    var pngArr = [];
    var base = path.join(projectRoot, png.deploy);

    if(png.useDir){
        base = path.join(projectRoot, '');
    }

    pngArr.push(from);
    Array.prototype.push.apply(pngArr, staticIgnore);

    if (ossOptions) {
        return gulp.src(pngArr)
            .pipe(cache('png'))
            .pipe(imagemin())
            .pipe(rev())
            .pipe(ossUpload(ossOptions))
            .pipe(rev.manifest(mapConfig, { base: virtualMapDir, merge: true, baseDir: path.join(projectRoot, 'pngTemp'), toDir: 'https://juheimg.oss-cn-hangzhou.aliyuncs.com/' + to }))
            // .pipe(gulp.dest(path.join(projectRoot, to)))
            // .pipe(rev.manifest(mapConfig, { base: virtualMapDir, merge: true, baseDir: path.join(projectRoot, '') }))
            .pipe(gulp.dest(mapDir));
    } else {
        return gulp.src(pngArr)
            .pipe(cache('png'))
            .pipe(imagemin())
            .pipe(rev())
            .pipe(gulp.dest(path.join(projectRoot, to)))
            .pipe(rev.manifest(mapConfig, { base: virtualMapDir, merge: true, baseDir: base }))
            .pipe(gulp.dest(mapDir));
    }


});

gulp.task('deploy:test', function(done) {

    if(releaseConfig.test){
        var test = releaseConfig.test;
        var from = options.dir + '/' + test.src;
        var to = test.deploy + '/' + namespace;
        var testArr = [];

        testArr.push(from);

        return gulp.src(testArr)
            // .pipe(cache('test'))
            .pipe(gulp.dest(path.join(projectRoot, to)));
    }else{
        done();
    }    
});

gulp.task('deploy:conf', function(done) {

    if(releaseConfig.conf){
        var conf = releaseConfig.conf;
        var from = options.dir + '/' + conf.src;
        var to = conf.deploy + '/' + namespace;
        var confArr = [];

        confArr.push(from);

        return gulp.src(confArr)
            // .pipe(cache('test'))
            .pipe(gulp.dest(path.join(projectRoot, to)));
    }else{
        done();
    } 
});

gulp.task('deploy:res', function() {
    var from = projectRoot + '/tmp/**';
    var htmlArr = [];
    htmlArr.push(mapConfig);
    htmlArr.push(from);

    return gulp.src(htmlArr)
        .pipe(revCollector())
        .pipe(gulp.dest(destRoot));
});



gulp.task('deploy:temp', function() {
    var from = projectRoot + '/temp/**';
    var htmlArr = [];
    var gulpSSH = new GulpSSH({
        ignoreErrors: false,
        sshConfig: releaseConfig.sshConfig
    });

    htmlArr.push(from);

    return gulp.src(htmlArr)
        .pipe(revCollector())
        .pipe(gulpSSH.dest(releaseConfig.root));
});

gulp.task('deploy:png', function() {
    var gulpSSH = new GulpSSH({
        ignoreErrors: false,
        sshConfig: releaseConfig.sshConfig
    });

    return gulp.src(projectRoot + '/' + releaseConfig.png.deploy + '/' + releaseConfig.png.src)
        .pipe(gulpSSH.dest(releaseConfig.root + '/' + releaseConfig.png.deploy));
});

gulp.task('clean:tmp', function() {
    process.stdout.write('clean...');
    return del([path.join(projectRoot, 'tmp'), path.join(projectRoot, 'pngTemp')], { force: true });
});

gulp.task('clean:temp', function() {
    return del([path.join(projectRoot, 'temp'), path.join(projectRoot, 'static')], { force: true });
});

gulp.task('compile', gulp.series('compile:html', 'compile:less', 'compile:js', 'compile:png', 'compile:pngTemp'));

gulp.task('deploy', gulp.series('deploy:res', 'deploy:test', 'deploy:conf', 'clean:tmp'));

gulp.task('deploy:machine', gulp.series('deploy:temp', 'deploy:png'));
gulp.task('push', gulp.series('deploy:machine', 'clean:temp'));

gulp.task('callback', function(done) {

    if(!output){
        var outputStr = 'compile success!at time:' + new Date().getTime();

        fs.writeFile(path.join(projectRoot, 'reload.conf'), outputStr, function(err) {
            if (err) throw err;
        });

        process.stdout.write('success');
    }else{
        del([path.join(projectRoot, 'map')], { force: true });
    } 
    done();
});

gulp.task('watch', function(done) {
    gulp.watch(watchArr, gulp.series('compile', 'deploy', 'callback'));
    done();
});

if (push) {
    gulp.task('release', gulp.series('compile', 'deploy', 'push', 'callback'));
} else if (clean && !watch && options.dest === 'default') {
    gulp.task('release', gulp.series('clean', 'callback'));
} else if (clean && watch) {
    gulp.task('release', gulp.series('clean', 'compile', 'deploy', 'watch', 'callback'));
} else if (clean) {
    gulp.task('release', gulp.series('clean', 'compile', 'deploy', 'callback'));
} else if (watch) {
    gulp.task('release', gulp.series('compile', 'deploy', 'watch', 'callback'));
} else {
    gulp.task('release', gulp.series('compile', 'deploy', 'callback'));
}

module.exports = gulp;
