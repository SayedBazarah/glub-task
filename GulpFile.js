const gulp = require("gulp");
const { src, dest, watch, parallel, series } = require("gulp");
var inject = require("gulp-inject");
var replace = require("gulp-replace-image-src");

var global = {
  html: "project/*.html",
  css: "project/css/**/*.css",
  img: "project/pics/*",
  js: "project/js/**/*.js",
};

//minify images and copy it to dist folder
const imagemin = require("gulp-imagemin");
//don't forget to install gulp-imagemin with version 7.1.0
function imgTast() {
  return gulp.src(global.img).pipe(imagemin()).pipe(gulp.dest("dist/images"));
}
//  exports.default = imgMinify
//  or
//run image task by 'gulp imgMinify' commond
exports.img = imgTast;

const htmlmin = require("gulp-htmlmin");
function htmlTast() {
  return src(global.html)
    .pipe(inject(src("./dist/assets/css/style.min.css")))
    .pipe(inject(src("./dist/assets/js/all.min.js")))
    .pipe(
      replace({
        prependSrc: "/dist/images/",
        keepOrigin: false,
      })
    )
    .pipe(htmlmin({ collapseWhitespace: true, removeComments: true }))
    .pipe(gulp.dest("dist"));
}

exports.html = htmlTast;
const concat = require("gulp-concat");
const terser = require("gulp-terser");

function jsTast() {
  //search for sourcemaps
  return (
    src(global.js, { sourcemaps: true }) //path includeing all js files in all folders
      //concate all js files in all.min.js
      .pipe(concat("all.min.js"))
      //use terser to minify js files
      .pipe(terser())
      //create source map file in the same directory
      .pipe(dest("./dist/assets/js", { sourcemaps: "." }))
  );
}
exports.js = jsTast;

var cleanCss = require("gulp-clean-css");
function cssTast() {
  return src(global.css)
    .pipe(concat("style.min.css"))
    .pipe(cleanCss())
    .pipe(dest("./dist/assets/css"));
}
exports.css = cssTast;

var browserSync = require("browser-sync");
function serve(cb) {
  browserSync({
    server: {
      baseDir: "./dist/",
    },
  });
  cb();
}

function reloadTask(done) {
  browserSync.reload();
  done();
}

//watch task
function watchTask() {
  watch(global.html, series(htmlTast, reloadTask));
  watch(global.js, series(jsTast, reloadTask));
  watch(global.css, series(cssTast, reloadTask));
  watch(global.img, series(imgTast, reloadTask));
}
exports.default = series(
  parallel(imgTast, jsTast, cssTast, htmlTast),
  serve,
  watchTask
);
