var autoprefixer = require( 'gulp-autoprefixer' ),
	concat       = require( 'gulp-concat' ),
	gulp         = require( 'gulp' ),
	sass 		 = require( 'gulp-sass' )( require( 'sass' ) ),
	cleancss 	 = require( 'gulp-clean-css' ),
	imagemin     = require( 'gulp-imagemin' ),
	jshint       = require( 'gulp-jshint' ),
	notify       = require( 'gulp-notify' ),
	plumber      = require( 'gulp-plumber' ),
	rename       = require( 'gulp-rename' ),
	sequence     = require( 'gulp-sequence' ),
	sourcemaps   = require( 'gulp-sourcemaps' ),
	svgsprite    = require( 'gulp-svg-sprite' ),
	terser       = require( 'gulp-terser' );

// Default Gulp task
gulp.task( 'default', gulp.series( css, js_back, js_front, done => {
	done();
}));

// Watch task
gulp.task( 'watch', gulp.series( css, js_back, js_front, function() {
	// Styles
	gulp.watch( 'src/scss/*.scss', gulp.series( css ) );

	// Scripts
	gulp.watch( ['src/js/modules/*.js', 'src/js/formtastic-admin.js'], gulp.series( js_back ) );
	gulp.watch( ['src/js/plugins/*.js', 'src/js/formtastic.js'], gulp.series( js_front ) );
}));

// Styles task
gulp.task( 'css', gulp.series( css, done => {
	done();
}));

function css() {
	return  gulp.src( 'src/scss/formtastic.scss', { base: 'src' } )
				.pipe( plumber({ errorHandler: notify.onError( 'Error: <%= error.message %>' ) }) )
				.pipe( sourcemaps.init() )
				.pipe( sass({
					outputStyle: 'expanded'
				}).on( 'error', sass.logError ) )
				.pipe( autoprefixer({
					cascade: false,
					remove: false
				}) )
				.pipe( concat( 'formtastic.css' ) )
				.pipe( cleancss({
					format: 'beautify',
					level: 2
				}) )
				.pipe( sourcemaps.write() )
				.pipe( gulp.dest( 'assets/css' ) )
				.pipe( sourcemaps.init({
					loadMaps: true
				}) )
				.pipe( rename({
					suffix: '.min'
				}) )
				.pipe( cleancss() )
				.pipe( sourcemaps.write() )
				.pipe( gulp.dest( 'assets/css' ) )
				.pipe( plumber.stop() );
}

// Scripts task
gulp.task( 'js-back', gulp.series( js_back, done => {
	done();
}));

function js_back() {
	return  gulp.src( ['src/js/modules/*.js', 'src/js/formtastic-admin.js'] )
				.pipe( sourcemaps.init() )
				.pipe( jshint({
					esnext: true
				}) )
				.pipe( jshint.reporter( 'default' ) )
				.pipe( concat( 'formtastic-admin.js' ) )
				.pipe( sourcemaps.write() )
				.pipe( gulp.dest( 'assets/js' ) )
				.pipe( terser() )
				.pipe( rename({
					suffix: '.min'
				}) )
				.pipe( gulp.dest( 'assets/js' ) );
}

gulp.task( 'js-front', gulp.series( js_front, done => {
	done();
}));

function js_front() {
	return  gulp.src( ['src/js/plugins/*.js', 'src/js/formtastic.js'] )
				.pipe( sourcemaps.init() )
				.pipe( jshint({
					esnext: true
				}) )
				.pipe( jshint.reporter( 'default' ) )
				.pipe( concat( 'formtastic.js' ) )
				.pipe( sourcemaps.write() )
				.pipe( gulp.dest( 'assets/js' ) )
				.pipe( terser() )
				.pipe( rename({
					suffix: '.min'
				}) )
				.pipe( gulp.dest( 'assets/js' ) );
}

// Images task
gulp.task( 'img-min', gulp.series( img_min, done => {
	done();
}));

function img_min() {
	return  gulp.src( 'src/img/*' )
				.pipe( imagemin() )
				.pipe( gulp.dest( 'assets/img' ) )
}

// SVG task
gulp.task( 'svg-sprite', gulp.series( svg_sprite, done => {
	done();
}));

function svg_sprite() {
    return  gulp.src( 'src/svg/*.svg' )
                .pipe( svgsprite({
                    mode : {
                        defs : true
                    }
                }) )
                .pipe( rename( 'icons.svg' ) )
                .pipe( gulp.dest( 'src/img' ) );
}
