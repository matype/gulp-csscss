[gulp](https://github.com/wearefractal/gulp)-csscss
===

gulp plugin that runs [csscss](http://zmoazeni.github.io/csscss/), a CSS redundancy analyzer.

To install the csscss gem run `gem install csscss` command, this will grab the latest version.

## Installation
Install with npm

```
npm install gulp-csscss --save-dev
```

## Example

```js
var gulp = require('gulp'),
    csscss = require('gulp-csscss');

gulp.task('default', function() {
  gulp.src('src/style.css')
    .pipe(csscss())
    .pipe(gulp.dest('dist'));
});
```

## License
MIT
