// Include Gulp
var gulp = require('gulp'); 

// Include Plugins
var plumber = require('gulp-plumber');
var watch = require('gulp-watch');
var rename = require('gulp-rename');
var livereload = require('gulp-livereload');
var concat = require('gulp-continuous-concat');
var less = require('gulp-less');
var coffee = require('gulp-coffee');
var browserify = require('gulp-browserify');


// Styles
// gulp.task('less', function() {
// 	return gulp.src('src/styles/main.less')
// 		//.pipe(watch())
// 		.pipe(plumber())
// 		.pipe(less({sourceMap: true}))
// 		.pipe(gulp.dest('public_html/styles'))
// 		.pipe(livereload())
// 		;
// });

//Scripts
gulp.task('coffee', function() {
	return gulp.src('scripts/main.coffee', {read: false})
		.pipe(plumber())
		.pipe( browserify({
			debug: true,
			transform: ['coffeeify'],
			extensions: ['.coffee']
		}))
		.pipe(rename('app.js'))
		.pipe(gulp.dest('scripts'))
		.pipe(livereload())
		;
});

//Assets
// gulp.task('images', function() {
// 	return gulp.src('src/images/**')
// 		.pipe(plumber())
// 		.pipe(gulp.dest('public_html/images/'))
// 		;
// });




//Watch Files For Changes
gulp.task('watch', function() {
	// gulp.watch('src/styles/*.less', ['less']);
	gulp.watch('scripts/**/*.coffee', ['coffee']);
	// var server = livereload();
	// gulp.watch('templates/**').on('change', function(file) {server.changed(file.path);});

});

// Default Task
gulp.task('default', ['coffee', 'watch']);
