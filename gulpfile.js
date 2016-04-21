var gulp = require('gulp');
var uglify = require('gulp-uglify');
var concat = require('gulp-concat');
var ngAnnotate = require('gulp-ng-annotate');
var htmlmin = require('gulp-htmlmin');

gulp.task('default', ['js', 'html']);

gulp.task('js', function() {
    gulp.src('js/*.js')
        .pipe(ngAnnotate())
        .pipe(concat('penpen.bundle.min.js'))
        .pipe(uglify())
        .pipe(gulp.dest('www/js'));
});

gulp.task('html', function() {
    gulp.src('html/*.html')
        .pipe(htmlmin({ collapseWhitespace: true, removeComments: true }))
        .pipe(gulp.dest('www/templates'));
});
