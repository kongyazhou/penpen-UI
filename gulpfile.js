var gulp = require('gulp');
var uglify = require('gulp-uglify');
var concat = require('gulp-concat');
var ngAnnotate = require('gulp-ng-annotate');
var htmlmin = require('gulp-htmlmin');
var shell = require('shelljs');

gulp.task('default', ['build']);

gulp.task('js', function() {
    gulp.src('js/*.js')
        .pipe(ngAnnotate())
        .pipe(concat('penpen.bundle.min.js'))
        .pipe(uglify())
        .pipe(gulp.dest('www/js'));
});

gulp.task('html', function() {
    gulp.src('html/*.html')
        .pipe(htmlmin({
            collapseWhitespace: true,
            removeComments: true
        }))
        .pipe(gulp.dest('www/templates'));
});

gulp.task('build', ['js', 'html'], function() {
    shell.echo('\033[36m=========== Building ===========\033[0m');
    if (shell.exec('cordova build android').code !== 0) {
        shell.echo('\033[47;31m=========== Build Failed ===========\033[0m');
    } else {
        shell.echo('\033[32m=========== Build Successful ===========\033[0m');
    }
});

gulp.task('s', ['js', 'html'], function() {
    shell.echo('\033[36m=========== Ionic Serve ===========\033[0m');
/*    if (shell.exec('ionic serve').code !== 0) {
        shell.echo('\033[47;31m=========== Serve Failed ===========\033[0m');
    } else {
        shell.echo('\033[32m=========== Serve Successful ===========\033[0m');
    }*/
});

gulp.task('e', function() {
    shell.echo('\033[47;32m=========== Ionic Serve ===========\033[0m');
});