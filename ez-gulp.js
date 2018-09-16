var riot = require('gulp-riot');
var gulp = require('gulp');
var concat = require("gulp-concat");
var less = require('gulp-less');
var sourcemaps = require("gulp-sourcemaps");
var through = require('through2');
var uglify = require('gulp-uglify');
var util = require('gulp-util');
var babel = require('gulp-babel');
var ncp = require('ncp');
var path = require("path");
var rev = require('gulp-rev');
var clean = require('gulp-clean');
var execSync = require('child_process').execSync;

module.exports = function(opts) {
  opts.js = opts.js || {}; // javascript and riot files
  opts.less = opts.less || {}; // css and less
  opts.static = opts.static || []; // files to be directly copied over
  opts.mustache = opts.mustache || []; // mustache templates to be processed
  var build_tasks = ['cp-static'];
  var results = []
  for (var key in opts.js) {
    (function(key) {
      results.push(key + '-built.js');
      build_tasks.push("build-"+key);
      gulp.task('build-'+key, function () {
        if (key == "vendor") { // vendor files are already minified and babel-ifiied
          return gulp.src(opts.js[key])
            .pipe(concat(key + '-built.js'))
            .pipe(gulp.dest(opts.DEST));
        }
        return gulp.src(opts.js[key])
          .pipe(sourcemaps.init())
          .pipe(riot())
          .pipe(babel({
            presets: [ 'es2017' ],
            plugins: [ "transform-object-rest-spread" ],
          }))
          .pipe(concat(key + '-built.js'))
          .pipe(sourcemaps.write("."))
          .pipe(gulp.dest(opts.DEST))
      });
    })(key)
  }

  for (var key in opts.less) {
    (function(key) {
      build_tasks.push("build-"+key+"-css");
      results.push(key+'-built.css')
      gulp.task("build-"+key+"-css", function () {
        return gulp.src(opts.less[key])
          .pipe(less({}))
          .pipe(concat(key+'-built.css'))
          .pipe(gulp.dest(opts.DEST));
      });
    })(key);
  }

  gulp.task('clean',function() {
    return gulp.src(opts.DEST+"/*",{read: false})
      .pipe(clean())
  })

  gulp.task("cp-static",function() {
    var DEST = opts.DEST;
    if (!DEST.startsWith("/")) {
      DEST = path.join(__dirname,opts.DEST);
    }
    opts.static.forEach(function(file_or_directory) {
      var source = path.join(__dirname,file_or_directory);
      var dest = path.join(DEST,file_or_directory.replace(/src\//,''));
      ncp(source, dest);
    });
    opts.renames && opts.renames.forEach(function(r) {
      ncp(path.join(__dirname,r[0]),path.join(DEST,r[1]));
    });
  });

  gulp.task('build-revision', build_tasks.slice(), function() {
    return gulp.src(results.map(s => path.join(opts.DEST,s)))
      .pipe(rev())
      .pipe(gulp.dest(opts.DEST))
      .pipe(rev.manifest())
      .pipe(gulp.dest(opts.DEST))
  })
  build_tasks.push('build-revision');
  const watch_tasks = ['build-revision']

  if (opts.mustache.length) {
    const fs = require("fs");
    const mustache = require("gulp-mustache");

    gulp.task("build-mustache",build_tasks.slice(),function() {
      var manifest = JSON.parse(fs.readFileSync(path.join(opts.DEST,"rev-manifest.json")));
      const _package = JSON.parse(fs.readFileSync("package.json"));
      for (var key in manifest) {
        manifest[key.replace("-","").replace(".","")] = manifest[key]
      }
      return gulp.src(opts.mustache)
        .pipe(mustache({
          manifest: manifest,
          DEBUG: opts.environment == "development",
          package: JSON.stringify({
            version: _package.version,
            git_hash: execSync("git rev-parse HEAD").toString().trim(),
            dirty: !! execSync("git diff").toString(),
            environment: opts.environment,
          }),
        }))
        .pipe(gulp.dest(opts.DEST));
    });
    build_tasks.push('build-mustache');
    watch_tasks.push('build-mustache');
  }
  gulp.task('watch', build_tasks, function () {
    for (var key in opts.js) {
      gulp.watch(opts.js[key], ['build-'+key].concat(watch_tasks))
    }
    for (var key in opts.less) {
      var watch_files = opts.less[key].map((name) => name.match(/.*\//)[0]+"*");
      gulp.watch(watch_files, ['build-'+key+'-css'].concat(watch_tasks))
    }
    gulp.watch(opts.static.map(d => d.replace(/\/$/,"/**")),['cp-static']);
  });

  gulp.task('default', build_tasks);
  gulp.task('deploy', build_tasks);
}
