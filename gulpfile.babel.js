import autoprefixer from 'autoprefixer';
import babelify from 'babelify';
import browserify from 'browserify';
import del from 'del';
import gulp from 'gulp';
import gulpConcat from 'gulp-concat';
import gulpConnect from 'gulp-connect';
import gulpCssnano from 'gulp-cssnano';
import gulpPostcss from 'gulp-postcss';
import gulpRename from 'gulp-rename';
import gulpReplace from 'gulp-replace';
import gulpSass from 'gulp-sass';
import gulpUglify from 'gulp-uglify';
import gulpUtil from 'gulp-util';
import merge2 from 'merge2/index';
import nanoid from 'nanoid';
import runSequence from 'run-sequence';
import vinylBuffer from 'vinyl-buffer';
import vinylSourceStream from 'vinyl-source-stream';

const sources = {
  entryPoint: 'assets/scripts/index.js',
  index: 'assets/index.template.html',
  scripts: 'assets/scripts/**/*.js',
  styles: 'assets/styles/**/*.scss',
  img: 'assets/img/*',
  data: 'assets/data/*',
};

const vendorStyles = ['node_modules/nouislider/distribute/nouislider.min.css'];

const destinations = {
  root: 'public',
  img: 'public/img',
  data: 'public/data',
};

const postCssPlugins = [autoprefixer];

let version;

gulp.task('clean', () =>
  del([
    `${destinations.root}/*.js`,
    `${destinations.root}/*.css`,
    `${destinations.root}/*.html`,
  ]));

gulp.task('generate-version', (done) => {
  version = nanoid();
  done();
});

gulp.task('img', () =>
  gulp.src(sources.img)
    .pipe(gulp.dest(destinations.img)));

gulp.task('data', () =>
  gulp.src(sources.data)
    .pipe(gulp.dest(destinations.data)));

gulp.task('scripts', () =>
  browserify(sources.entryPoint)
    .transform(babelify)
    .bundle()
    .pipe(vinylSourceStream(`bundle-${version}.js`))
    .pipe(vinylBuffer())
    .pipe(gulpUtil.env.production ?
      gulpUglify({ compress: { comparisons: false } }) :
      gulpUtil.noop())
    .pipe(gulp.dest(destinations.root)));

gulp.task('styles', () =>
  merge2(
    gulp.src(vendorStyles),
    gulp.src(sources.styles)
      .pipe(gulpSass())
      .pipe(gulpPostcss(postCssPlugins))
      .pipe(gulpCssnano({
        discardUnused: { fontFace: false },
        zindex: false,
      })),
  )
    .pipe(gulpConcat(`stylesheet-${version}.css`))
    .pipe(gulp.dest(destinations.root)));

gulp.task('index', () =>
  gulp.src(sources.index)
    .pipe(gulpRename((path) => {
      path.basename = path.basename.replace('.template', '');
    }))
    .pipe(gulpReplace('{version}', version))
    .pipe(gulp.dest(destinations.root))
    .pipe(process.argv.indexOf('dev') !== -1 ? gulpConnect.reload() : gulpUtil.noop()));

gulp.task('resources', [
  'img',
  'data',
]);

gulp.task('build', () => {
  runSequence(
    [
      'clean',
      'generate-version',
    ], [
      'scripts',
      'styles',
    ],
    'index',
  );
});

gulp.task('connect', () => {
  gulpConnect.server({
    root: destinations.root,
    livereload: true,
  });
});

gulp.task('watch', () => {
  gulp.watch(sources.scripts, ['build']);
  gulp.watch(sources.styles, ['build']);
});

gulp.task('dev', [
  'connect',
  'watch',
]);

gulp.task('default', [
  'resources',
  'build',
]);
