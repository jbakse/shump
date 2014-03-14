// Include Gulp
var gulp = require('gulp'); 

// Include Plugins
var plumber = require('gulp-plumber');
var watch = require('gulp-watch');
var livereload = require('gulp-livereload');
var concat = require('gulp-concat');
var less = require('gulp-less');
var coffee = require('gulp-coffee');

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
	return gulp.src('scripts/*.coffee')
		.pipe(watch())
		.pipe(plumber())
		.pipe(coffee({sourceMap: true}))
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
// gulp.task('watch', function() {
// 	gulp.watch('src/styles/*.less', ['less']);
// 	gulp.watch('src/scripts/*.coffee', ['coffee']);
// 	var server = livereload();
// 	gulp.watch('templates/**').on('change', function(file) {server.changed(file.path);});

// });

// Default Task
gulp.task('default', ['coffee']);