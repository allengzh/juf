// gulp-css-spriter: https://www.npmjs.com/package/gulp-css-spriter
// Sprite Sheet Generation from CSS source files.
//
// By: Eric Eastwood: EricEastwood.com
//
// Meta info looks like: `/* @meta {"spritesheet": {"include": false}} */`

var fs = require('fs-extra');
var path = require('path');

var through = require('through2');
var extend = require('extend')
var gutil = require('gulp-util');

var css = require('css');
var spritesmith = require('./lib/smith');


var spriterUtil = require('./lib/spriter-util');
var getBackgroundImageDeclarations = require('./lib/get-background-image-declarations');
var transformFileWithSpriteSheetData = require('./lib/transform-file-with-sprite-sheet-data');

// consts
const PLUGIN_NAME = 'gulp-css-spriter';

function relPath(base, filePath) {
    if (filePath.indexOf(base) !== 0) {
        return filePath.replace(/\\/g, '/');
    }

    var newPath = filePath.substr(base.length).replace(/\\/g, '/');
    if (newPath[0] === '/') {
        return newPath.substr(1);
    }

    return newPath;
}

function fsExistsSync(path) {
    try {
        fs.accessSync(path, fs.F_OK);
    } catch (e) {
        return false;
    }
    return true;
}



var spriter = function(options) {

    var defaults = {
        // ('implicit'|'explicit')
        'includeMode': 'implicit',
        // The path and file name of where we will save the sprite sheet
        'spriteSheet': 'spritesheet.png',
        // Because we don't know where you will end up saving the CSS file at this point in the pipe,
        // we need a litle help identifying where it will be.
        'pathToSpriteSheetFromCSS': 'spritesheet.png',
        // Same as the spritesmith callback `function(err, result)`
        // result.image: Binary string representation of image
        // result.coordinates: Object mapping filename to {x, y, width, height} of image
        // result.properties: Object with metadata about spritesheet {width, height}
        'spriteSheetBuildCallback': null,
        // If true, we ignore any images that are not found on disk
        // Note: this plugin will still emit an error if you do not verify that the images exist
        'silent': true,
        // Check to make sure each image declared in the CSS exists before passing it to the spriter.
        // Although silenced by default(`options.silent`), if an image is not found, an error is thrown.
        'shouldVerifyImagesExist': true,
        // Any option you pass in here, will be passed through to spritesmith
        // https://www.npmjs.com/package/spritesmith#-spritesmith-params-callback-
        'spritesmithOptions': {},
        // Used to format output CSS
        // You should be using a separate beautifier plugin
        'outputIndent': '\t',
        'fromBaseDir': process.cwd(),
        'toBaseDir': process.cwd()
    };

    var settings = extend({}, defaults, options);

    // Keep track of all the chunks that come in so that we can re-emit in the flush
    var chunkList = [];
    // We use an object for imageMap so we don't get any duplicates
    var imageMap = {};
    // Check to make sure all of the images exist(`options.shouldVerifyImagesExist`) before trying to sprite them
    var imagePromiseArray = [];
    var chunkImage = {};

    var stream = through.obj(function(chunk, enc, cb) {
        // http://nodejs.org/docs/latest/api/stream.html#stream_transform_transform_chunk_encoding_callback
        //console.log('transform');

        // Each `chunk` is a vinyl file: https://www.npmjs.com/package/vinyl
        // chunk.cwd
        // chunk.base
        // chunk.path
        // chunk.contents


        if (chunk.isStream()) {
            self.emit('error', new gutil.PluginError(PLUGIN_NAME, 'Cannot operate on stream'));
        } else if (chunk.isBuffer()) {
            var contents = String(chunk.contents);

            var styles;
            try {
                styles = css.parse(contents, {
                    'silent': settings.silent,
                    'source': chunk.path
                });
            } catch (err) {
                err.message = 'Something went wrong when parsing the CSS: ' + err.message;
                self.emit('log', err.message);

                // Emit an error if necessary
                if (!settings.silent) {
                    self.emit('error', err);
                }
            }
            imagePromiseArray = [];
            var oldFile = relPath(chunk.base, chunk.path);
            var originalFile = path.join(path.dirname(oldFile), path.basename(chunk.revOrigPath)).replace(/\\/g, '/');

            var fromPngUrl = originalFile.replace('.less', '.png');
            var toPngUrl = '/' + relPath(settings.fromBaseDir, fromPngUrl);
            var toUrl = settings.toBaseDir + toPngUrl;

            chunkImage[chunk.path] = {};
            chunkImage[chunk.path].spriteSheet = toUrl;
            chunkImage[chunk.path].pathToSpriteSheetFromCSS = toPngUrl;
            // Gather a list of all of the image declarations
            var chunkBackgroundImageDeclarations = getBackgroundImageDeclarations(styles, settings.includeMode);

            // Go through each declaration and gather the image paths
            // We find the new images that we found in this chunk verify they exist below
            //      We use an object so we don't get any duplicates
            var newImagesfFromChunkMap = {};
            var backgroundURLMatchAllRegex = new RegExp(spriterUtil.backgroundURLRegex.source, "gi");

            chunkBackgroundImageDeclarations.forEach(function(declaration) {

                // Match each background image in the declaration (there could be multiple background images per value)
                spriterUtil.matchBackgroundImages(declaration.value, function(imagePath) {
                    imagePath = path.join(settings.fromBaseDir, imagePath);

                    // If not already in the overall list of images collected
                    // Add to the queue/list of images to be verified
                    if (!imageMap[imagePath]) {
                        newImagesfFromChunkMap[imagePath] = true;
                    }

                    // Add it to the main overall list to keep track
                    imageMap[imagePath] = true;
                });
            });

            // Filter out any images that do not exist depending on `settings.shouldVerifyImagesExist`
            Object.keys(newImagesfFromChunkMap).forEach(function(imagePath) {
                var filePromise;
                if (settings.shouldVerifyImagesExist) {
                    if (fsExistsSync(imagePath)) {
                        filePromise = {
                            doesExist: true,
                            path: imagePath
                        };
                    } else {
                        filePromise = {
                            doesExist: false,
                            path: imagePath
                        };
                    }
                } else {
                    // If they don't want us to verify it exists, just pass it on with a undefined `doesExist` property
                    filePromise = {
                        doesExist: undefined,
                        path: imagePath
                    };
                }

                imagePromiseArray.push(filePromise);
            });
            chunkList.push(chunk);
            chunkImage[chunk.path].img = imagePromiseArray;

        }
        // "call callback when the transform operation is complete."
        cb();
    }, function(cb) {

        var self = this;
        var j = 0;

        for(var i=0;i<chunkList.length;i++){
            var chunk = chunkList[i];
            imagePromiseArray = chunkImage[chunk.path].img;
            if (imagePromiseArray.length) {
                var imageList = [];
                Array.prototype.forEach.call(imagePromiseArray, function(imageInfo) {

                    if (imageInfo.doesExist === true || imageInfo.doesExist === undefined) {

                        imageList.push(imageInfo.path);
                    } else {
                        // Tell them that we could not find the image
                        var logMessage = 'Image could not be found: ' + imageInfo.path;
                        self.emit('log', logMessage);

                        // Emit an error if necessary
                        if (!settings.silent) {
                            self.emit('error', new Error(logMessage));
                        }
                    }
                });
                var spritesmithOptions = extend({}, settings.spritesmithOptions, { src: imageList });
                spritesmith.run(spritesmithOptions, chunkImage[chunk.path], chunk, function handleResult(err, result, obj, chunk) {
                    if (err) {
                        err.message = 'Error creating sprite sheet image:\n' + err.message;
                        self.emit('error', new gutil.PluginError(PLUGIN_NAME, err));
                    } else {

                        fs.outputFile(obj.spriteSheet, result.image, 'binary', function(err) {
                            if (err) {
                                if (settings.spriteSheetBuildCallback) {
                                    settings.spriteSheetBuildCallback(null, result);
                                }
                                self.emit('error', err);
                            }
                        });
                        var transformedChunk = chunk.clone();
                        try {
                            transformedChunk = transformFileWithSpriteSheetData(settings.fromBaseDir, transformedChunk, result.coordinates, obj.pathToSpriteSheetFromCSS, settings.includeMode, settings.silent, settings.outputIndent);
                        } catch (err) {
                            err.message = 'Something went wrong when transforming chunks: ' + err.message;
                            self.emit('log', err.message);

                            // Emit an error if necessary
                            if (!settings.silent) {
                                self.emit('error', err);
                            }

                        }
                        j++
                        console.log(transformedChunk.path);
                        self.push(transformedChunk);
                        if(chunkList.length === j){
                            cb();
                        }
                    }
                });
            } else {
                j++
                self.push(chunk);
                if(chunkList.length === j){
                    cb();
                }
            }
        }

            
    });
    // returning the file stream
    return stream;
};

module.exports = spriter;
