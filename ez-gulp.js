const riot = require('gulp-riot');
const gulp = require('gulp');
const concat = require("gulp-concat");
const less = require('gulp-less');
const sourcemaps = require("gulp-sourcemaps");
const through = require('through2');
const uglify = require('gulp-uglify');
const util = require('gulp-util');
const babel = require('gulp-babel');
const ncp = require('ncp');
const path = require("path");
const rev = require('gulp-rev');
const clean = require('gulp-clean');
const execSync = require('child_process').execSync;
const fs = require("fs");
const crypto = require('crypto');

module.exports = function(opts) {
  opts.js = opts.js || {}; // javascript and riot files
  opts.less = opts.less || {}; // css and less
  opts.static = opts.static || []; // files to be directly copied over
  opts.mustache = opts.mustache || []; // mustache templates to be processed
  const build_tasks = ['cp-static','git-version'];
  const results = [];
  for (let key in opts.js) {
    results.push(key + '-built.js');
    build_tasks.push("build-"+key);
    const dirs = key.split("/");
    const name = dirs.pop();
    const dest = path.normalize(opts.DEST+"/"+dirs.join("/"));
    gulp.task('build-'+key, function () {
      if (key == "vendor") { // vendor files are already minified and babel-ifiied
        return gulp.src(opts.js[key]).pipe(concat(key + '-built.js')).pipe(gulp.dest(dest));
      }
      return gulp.src(opts.js[key])
        .pipe(sourcemaps.init())
        .pipe(riot())
        .pipe(babel({
          presets: [ 'es2017' ],
          plugins: [ "transform-object-rest-spread" ],
        }))
        .pipe(concat(name + '-built.js'))
        .pipe(sourcemaps.write("."))
        .pipe(gulp.dest(dest))
    });
  }

  for (let key in opts.less) {
    build_tasks.push("build-"+key+"-css");
    results.push(key+'-built.css')
    gulp.task("build-"+key+"-css", function () {
      return gulp.src(opts.less[key])
        .pipe(less({}))
        .pipe(concat(key+'-built.css'))
        .pipe(gulp.dest(opts.DEST));
    });
  }

  gulp.task('clean', function() {
    return gulp.src(opts.DEST+"/*",{read: false})
      .pipe(clean())
  })

  gulp.task("cp-static",function() {
    let DEST = opts.DEST;
    if (!DEST.startsWith("/")) {
      DEST = path.join(__dirname,opts.DEST);
    }
    opts.static.forEach(function(file_or_directory) {
      let source = path.join(__dirname,file_or_directory);
      let dest = path.join(DEST,file_or_directory.replace(/src\//,''));
      ncp(source, dest);
    });
    (opts.renames || []).forEach((r) => {
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
  const watch_tasks = ['build-revision','git-version']

  const getGit = () => {
    const md5sum = crypto.createHash('md5');
    const dirty = execSync("git diff").toString().trim();
    return {
      git_hash: execSync("git rev-parse HEAD").toString().trim().slice(0,7),
      dirty: dirty && md5sum.update(dirty).digest('hex').slice(0,7),
    }
  }

  gulp.task("git-version",() => {
    !fs.existsSync(opts.DEST) && fs.mkdirSync(opts.DEST)
    const data = getGit();
    fs.writeFileSync(path.join(opts.DEST,'git-version.js'),JSON.stringify(data))
  })

  if (opts.mustache.length) {
    const mustache = require("gulp-mustache");

    gulp.task("build-mustache",build_tasks.slice(),function() {
      const manifest = JSON.parse(fs.readFileSync(path.join(opts.DEST,"rev-manifest.json")));
      const _package = JSON.parse(fs.readFileSync("package.json"));
      for (let key in manifest) {
        manifest[key.replace("-","").replace(".","")] = manifest[key]
      }
      return gulp.src(opts.mustache)
        .pipe(mustache({
          manifest: manifest,
          DEBUG: opts.environment == "development",
          package: JSON.stringify({
            version: _package.version,
            environment: opts.environment,
            ...getGit(),
          }),
        }))
        .pipe(gulp.dest(opts.DEST));
    });
    build_tasks.push('build-mustache');
    watch_tasks.push('build-mustache');
  }

  gulp.task('watch', ['default'], function() {
    for (let key in opts.js) {
      gulp.watch(opts.js[key], ['build-'+key].concat(watch_tasks))
    }
    for (let key in opts.less) {
      let watch_files = opts.less[key].map((name) => name.match(/.*\//)[0]+"*");
      gulp.watch(watch_files, ['build-'+key+'-css'].concat(watch_tasks))
    }
    gulp.watch(opts.static.map(d => d.replace(/\/$/,"/**")),['cp-static','git-version']);
  });

  gulp.task('default', build_tasks)
  gulp.task('deploy', build_tasks);
}
