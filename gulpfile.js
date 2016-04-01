/* jshint node: true */
"use strict";

//How to debug gulp tasks: https://github.com/node-inspector/node-inspector#user-content-how-do-i-debug-gulp-tasks
//NB: debugger is super slow for projects with many modules
//node-debug --no-preload --hidden node_modules/ -p 8081  %appdata%\npm\node_modules\gulp\bin\gulp.js --gulpfile path-to-project\gulpfile.js myTask

var config = require('./gulp.config'),
    gulp = require('gulp'),
    gulpSequence = require('gulp-sequence'),
    jshint = require('gulp-jshint'),
    jscs = require('gulp-jscs'),
    util = require('gulp-util'),
    useref = require('gulp-useref'),
    gulpif = require('gulp-if'),
    uglify = require('gulp-uglify'),
    csso = require('gulp-csso'),
    csslint = require('gulp-csslint'),
    html5Lint = require('gulp-html5-lint'),
    del = require('del'),
    colors = util.colors;

gulp.task('default', gulpSequence('lint', 'build'));

gulp.task('lint', gulpSequence('lint-js', 'lint-css', 'lint-html'));

gulp.task('lint-js', function () {
    return gulp
        .src(config.jsToInspect)
        .pipe(jshint())
        .pipe(jshint.reporter('jshint-stylish', { verbose: true }))
        .pipe(jscs())
        .pipe(jscs.reporter());
});

gulp.task('lint-css', function () {
    gulp.src(config.css)
        .pipe(csslint())
        .pipe(csslint.reporter());
});

gulp.task('lint-html', function () {
    return gulp.src(config.htmlFiles)
        .pipe(html5Lint());
});

gulp.task('build', gulpSequence(
    'clean',
    ['html', 'images', 'fonts'],
    'optimise-css-js'
));

gulp.task('clean', function (cb) {
    clean(config.buildDir, cb);
});

gulp.task('html', function () {
    info('Copying html files');

    return gulp
        .src(config.htmlFiles, { base: './' })
        .pipe(gulp.dest(config.buildDir));
});

gulp.task('fonts', function () {
    info('Copying font files');

    return gulp
        .src(config.fonts, { base: './' })
        .pipe(gulp.dest(config.buildDir));
});

gulp.task('images', function () {
    info('Copying images');

    return gulp
        .src(config.images, { base: './' })
        .pipe(gulp.dest(config.buildDir));
});

gulp.task('optimise-css-js', function () {
    info('Copying and optimising main css js');

    return gulp
        .src(config.htmlFiles)
        .pipe(useref())
        .pipe(gulpif('*.js', uglify()))
        .pipe(gulpif('*.css', csso()))
        .pipe(gulp.dest(config.buildDir));
});

function clean(path, cb) {
    info('Cleaning ' + path);

    del(path).then(function (p) {
        info('Cleaned  ' + path);
        cb();
    });
}

function info(msg) {
    log(colors.green(msg));
}

function error(msg) {
    log(colors.red(msg));
}

function log(msg) {
    console.log(msg);
}
