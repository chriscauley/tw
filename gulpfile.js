var riot = require('gulp-riot');
var gulp = require('gulp');
var concat = require("gulp-concat");
var less = require('gulp-less');
var sourcemaps = require("gulp-sourcemaps");
var through = require('through2');
var uglify = require('gulp-uglify');
var util = require('gulp-util');
var babel = require('gulp-babel');

var PROJECT_NAME = "tw";

var JS_FILES = [
  "pallet.js",
  "canvas.js",
  "font.js",
  "item.js",

  "controller.js",
  "board.js",
  "square.js",
  "floor.js",
  "levels.js",
  "map-sprite.js",
  "piece.js",
  "player.js",
  "game.js",
  "main.js",
  "ui.tag",
];

gulp.task('build-js', function () {
  return gulp.src(JS_FILES)
    .pipe(riot())
    .pipe(babel({ presets: ['es2017'] }))
    .pipe(sourcemaps.init())
    .pipe(concat(PROJECT_NAME + '-built.js'))
    //.pipe(uglify({mangle: false, compress: false}))
    .pipe(sourcemaps.write("."))
    .pipe(gulp.dest(".dist/"));
});

LESS_FILES = ["less/base.less"];

gulp.task('build-css', function () {
  return gulp.src(LESS_FILES)
    .pipe(less({}))
    .pipe(concat(PROJECT_NAME+'-built.css'))
    .pipe(gulp.dest(".dist/"));
});

var build_tasks = ['build-js', 'build-css',];
gulp.task('watch', build_tasks, function () {
  gulp.watch(JS_FILES, ['build-js']);
  gulp.watch(["less/*.less",], ['build-css']);
});

gulp.task('default', build_tasks);
