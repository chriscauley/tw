var riot = require('gulp-riot');
var gulp = require('gulp');
var concat = require("gulp-concat");
var less = require('gulp-less');
var sourcemaps = require("gulp-sourcemaps");
var uglify = require('gulp-uglify');
var util = require('gulp-util');
var babel = require('gulp-babel');
var argv = require('yargs').argv;
var path = require("path");
var ncp = require('ncp');

var PROJECT_NAME = "tw";
var DEST = (argv._[0] == 'deploy')?"/var/timewalker.io/":".dist/";

var JS_FILES = [
  "main.js",
  "dungeon/const.js",
  "dungeon/templates.js",
  "dungeon/utils/index.js",
  "dungeon/utils/array2d.js",
  "dungeon/utils/random.js",
  "dungeon/utils/rectangle.js",
  "dungeon/pieces/piece.js",
  "dungeon/pieces/room.js",
  "dungeon/pieces/corridor.js",
  "dungeon/generators/generator.js",
  "dungeon/generators/dungeon.js",
  "pallet.js",
  "sprite.js",
  "item.js",
  "floor.js",
  "moves.js",
  "piece.js",
  "player.js",
  "square.js",
  "board.js",
  "game.js",
  "score.js",
  "team.js",
  "levels.js",
  "ui.tag",
  "map-sprite.tag",

  "equipment/base.js",
];

gulp.task('build-js', function () {
  return gulp.src(JS_FILES)
    .pipe(riot())
    .pipe(babel({ presets: ['es2017'] }))
    .pipe(sourcemaps.init())
    .pipe(concat(PROJECT_NAME + '-built.js'))
    //.pipe(uglify({mangle: false, compress: false}))
    .pipe(sourcemaps.write("."))
    .pipe(gulp.dest(DEST));
});

LESS_FILES = ["less/base.less"];

gulp.task('build-css', function () {
  return gulp.src(LESS_FILES)
    .pipe(less({}))
    .pipe(concat(PROJECT_NAME+'-built.css'))
    .pipe(gulp.dest(DEST));
});

var STATIC_FILES = [
  'index.html',
  'data.json',
]

gulp.task("cp-static",function() {
  STATIC_FILES.forEach(function(_dir) {
    var source = path.join(__dirname,_dir);
    var dest = path.join(DEST,_dir);
    ncp(source, dest)
  });
})

var build_tasks = ['build-js', 'build-css', 'cp-static'];
gulp.task('watch', build_tasks, function () {
  gulp.watch(JS_FILES, ['build-js']);
  gulp.watch(["base.less","less/*.less",], ['build-css']);
});

gulp.task('default', build_tasks);
gulp.task('deploy', build_tasks);
