var dargs = require('dargs'),
    fs = require('fs'),
    gutil = require('gulp-util'),
    path = require('path'),
    spawn = require('win-spawn'),
    tempWrite = require('temp-write'),
    through = require('through2'),
    which = require('which');

module.exports = function gulpCsscss(options) {
  options = options || {};

  var passedArgs = dargs(options, ['bundleExec']);
  var bundleExec = options.bundleExec;

  try {
    which.sync('csscss');
  } catch (err) {
    throw new gutil.PluginError('gulp-csscss', 'You need to have Ruby and CSSCSS installed and in your PATH for this task to work.');
  }

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

      var args = [
        'csscss',
        tempFile,
        tempFile,
        '--load-path', path.dirname(file.path)
      ].concat(passedArgs);

      if (bundleExec) {
        args.unshift('bundle', 'exec');
      }

      var cp = spawn(args.shift(), args);

      cp.on('error', function (err) {
        self.emit('error', new gutil.PluginError('gulp-csscss', err));
        self.push(file);
        return cb();
      });

      var errors = '';
      cp.stderr.setEncoding('utf8');
      cp.stderr.on('data', function (data) {
        errors += data;
      });

      cp.on('close', function (code) {
        if (errors) {
          self.emit('error', new gutil.PluginError('gulp-csscss', '\n' + errors.replace(tempFile, file.path).replace('Use --trace for backtrace.\n', '')));
          self.push(file);
          return cb();
        }

        if (code > 0) {
          self.emit('error', new gutil.PluginError('gulp-csscss', 'Exited with error code ' + code));
          self.push(file);
          return cb();
        }

        fs.readFile(tempFile, function (err, data) {
          if (err) {
            self.emit('error', new gutil.PluginError('gulp-csscss', err));
            self.push(file);
            return cb();
          }

          self.push(new gutil.File({
            base: path.dirname(file.path),
            path: gutil.replaceExtension(file.path, '.css'),
            contents: data
          }));

          if (!options.sourcemap) {
            return cb();
          }

          fs.readFile(tempFile + '.map', function (err, data) {
            if (err) {
              self.emit('error', new gutil.PluginError('gulp-csscss', err));
              return cb();
            }

            self.push(new gutil.File({
              base: path.dirname(file.path),
              path: file.path + '.map',
              contents: data
            }));

            cb();
          });
        });
      });
    });
  });
};
