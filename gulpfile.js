const { src, dest, watch, parallel, series } = require('gulp');

const scss = require('gulp-sass')(require('sass'));
const concat = require('gulp-concat');
const uglify = require('gulp-uglify-es').default;
const browserSync = require('browser-sync').create();
const autoprefixer = require('gulp-autoprefixer');
const clean = require('gulp-clean');
const webp = require('gulp-webp');
const imagemin = require('gulp-imagemin');
const newer = require('gulp-newer');
const fonter = require('gulp-fonter');
const ttf2woff2 = require('gulp-ttf2woff2');
const htmlmin = require('gulp-htmlmin');

function fonts() {
  return src('app/fonts/src/*.*')
    .pipe(
      fonter({
        formats: ['ttf'],
      })
    )
    .pipe(src('app/fonts/*.ttf'))
    .pipe(ttf2woff2())
    .pipe(dest('app/fonts'));
}

function images() {
  return src('app/img/src/**/*.*')
    .pipe(newer('app/img'))
    .pipe(webp())

    .pipe(src('app/img/src/**/*.*'))
    .pipe(newer('app/img'))
    .pipe(
      imagemin([
        imagemin.optipng({ optimizationLevel: 3 }),
        imagemin.svgo({ plugins: [{ removeViewBox: false }] }),
      ])
    )
    .pipe(dest('app/img'));
}

function scripts() {
  return src('app/js/main.js')
    .pipe(concat('script.min.js'))
    .pipe(uglify())
    .pipe(dest('app/js'))
    .pipe(browserSync.stream());
}

function styles() {
  return src('app/scss/main.scss')
    .pipe(autoprefixer({ overrideBrowserslist: ['last 2 versions'] }))
    .pipe(concat('style.min.css'))
    .pipe(scss({ outputStyle: 'compressed' }))
    .pipe(dest('app/css'))
    .pipe(browserSync.stream());
}

function html() {
  return src('app/index.html')
    .pipe(htmlmin({ collapseWhitespace: true, removeComments: true }))
    .pipe(dest('dist'));
}

function watcher() {
  browserSync.init({
    server: {
      baseDir: 'app/',
    },
    notify: false,
  });
  watch(['app/scss'], styles);
  watch(['app/img/src'], images);
  watch(['app/js/main.js'], scripts);
  watch(['app/fonts/src'], fonts);
  watch(['app/*.html']).on('change', browserSync.reload);
}

function cleanDist() {
  return src('dist').pipe(clean());
}

function building() {
  return src(
    [
      'app/css/style.min.css',
      'app/img/**/*.*',
      '!app/img/src/**',
      'app/fonts/*.*',
      'app/js/script.min.js',
    ],
    {
      base: 'app',
    }
  ).pipe(dest('dist'));
}

exports.styles = styles;
exports.html = html;
exports.images = images;
exports.fonts = fonts;
exports.scripts = scripts;
exports.watcher = watcher;

exports.build = series(cleanDist, html, building);
exports.default = parallel(styles, images, scripts, fonts, watcher);
