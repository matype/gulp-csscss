/*jshint node:true */
'use strict';

var dargs = require('dargs');
var gutil = require('gulp-util');
var path = require('path');
var tempWrite = require('temp-write');
var through = require('through2');
var which = require('which');
var exec = require('child_process').exec;

module.exports = function gulpCsscss(options) {
    try {
        which.sync('csscss');
    } catch (err) {
        throw new gutil.PluginError('gulp-csscss', 'You need to have Ruby and CSSCSS installed and in your PATH for this task to work.');
    }

    options = options || {};

    return through.obj(function (file, enc, cb) {
        var self = this;

        if (file.isNull() || path.basename(file.path)[0] === '_') {
            this.push(file);
            return cb();
        }

        if (file.isStream()) {
            this.emit('error', new gutil.PluginError('gulp-csscss', 'Streaming not supported'));
            return cb();
        }

        tempWrite(file.contents, path.basename(file.path), function (err, tempFile) {
            if (err) {
                self.emit('error', new gutil.PluginError('gulp-csscss', err));
                self.push(file);
                return cb();
            }

            var command = 'csscss';

            if (options.bundleExec) {
                command = 'bundle exec csscss';
            }

            var passedArgs = dargs(options, {excludes: ['bundleExec']});

            command = command + ' ' + passedArgs.join(' ') + ' "' + tempFile + '"';

            var child = exec(command, function(err, stdout, stderr) {
                if (!err) {
                    console.log('Result of running CSSCSS:');
                    console.log(stdout);
                } else {
                    console.log(err);
                    console.log(err.code);
                    console.log(err.signal);
                }
            });
        });
    });
};
