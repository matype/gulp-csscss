'use script';

var gulp = require('gulp');
var csscss = require('./');

gulp.task('default', function() {
    gulp.src('test/test.css')
    .pipe(csscss())
});
