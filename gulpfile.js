var gulp = require('gulp');
var uglify = require('gulp-uglify');
var concat = require('gulp-concat');
var ngAnnotate = require('gulp-ng-annotate');

gulp.task('default', function() {
  gulp.src('js/*.js')
  .pipe(ngAnnotate())
  .pipe(concat('penpen.bundle.min.js'))
  .pipe(uglify())  
  .pipe(gulp.dest('www/js'));
});