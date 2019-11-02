// Plugins required
var gulp  = require( 'gulp' ),
	// CSS related
	autoprefixer = require( 'gulp-autoprefixer' ),
	minifycss    = require( 'gulp-uglifycss' ),
	mmq          = require( 'gulp-merge-media-queries' ),
	sass         = require( 'gulp-sass' ),

	// JS related
	concat = require( 'gulp-concat' ),
	jshint = require( 'gulp-jshint' ),
	uglify = require( 'gulp-uglify' ),

	// Others
	util	  = require( 'gulp-util' ),
	filter    = require( 'gulp-filter' ),
	imagemin  = require( 'gulp-imagemin' ),
	notify    = require( 'gulp-notify' ),
	plumber   = require( 'gulp-plumber' ),
	rename    = require( 'gulp-rename' ),
	sequence  = require( 'gulp-sequence' ),
	svgsprite = require( 'gulp-svg-sprite' );

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

	// SVG
    gulp.watch( 'src/svg/*.svg', function( event ) {
		sequence( svg_sprite, img_min ) ( function( err ) {
			if ( err ) console.log( err );
		});
    });
}));

// Styles task
function css() {
	return  gulp.src( 'src/scss/formtastic.scss' )
				.pipe( plumber({ errorHandler: notify.onError( 'Error: <%= error.message %>' ) }) )
				.pipe( sass({
					errLogToConsole: true,
					outputStyle: 'expanded',
					precision: 10
				}) )
				.pipe( autoprefixer({
					cascade: false,
					remove: false
				}) )
				.pipe( plumber.stop() )
				.pipe( filter( '**/*.css' ) )
				.pipe( mmq({
					log: true
				}) )
				.pipe( rename( 'formtastic.css' ) )
				.pipe( gulp.dest( 'assets/css' ) )
				.pipe( rename({ suffix: '.min' }) )
				.pipe( minifycss({ 
					maxLineLen: 0,
					uglyComments: true
				}) )
				.pipe( gulp.dest( 'assets/css' ) );
}

// Scripts task
function js_back() {
	return  gulp.src( ['src/js/modules/*.js', 'src/js/formtastic-admin.js'] )
				.pipe( jshint() )
				.pipe( jshint.reporter( 'default' ) )
				.pipe( concat( 'formtastic-admin.js' ) )
				.pipe( gulp.dest( 'assets/js' ) )
				.pipe( uglify() )
				.on( 'error', function( err ) { 
					util.log( util.colors.red( '[Error]' ), err.toString() ); 
				} )
				.pipe( rename( { suffix: '.min' } ) )
				.pipe( gulp.dest( 'assets/js' ) );
}

function js_front() {
	return  gulp.src( ['src/js/plugins/*.js', 'src/js/formtastic.js'] )
				.pipe( jshint() )
				.pipe( jshint.reporter( 'default' ) )
				.pipe( concat( 'formtastic.js' ) )
				.pipe( gulp.dest( 'assets/js' ) )
				.pipe( uglify() )
				.on( 'error', function( err ) { 
					util.log( util.colors.red( '[Error]' ), err.toString() ); 
				} )
				.pipe( rename( { suffix: '.min' } ) )
				.pipe( gulp.dest( 'assets/js' ) );
}

// Images task
function img_min() {
	return  gulp.src( 'src/img/*' )
				.pipe( imagemin() )
				.pipe( gulp.dest( 'assets/img' ) )
}

// SVG task
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
