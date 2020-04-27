const gulp = require('gulp');
const ts = require('gulp-typescript');
const tsProject = ts.createProject('tsconfig.json');
const gulpCopy = require('gulp-copy');

gulp.task('ts', () => {
	return tsProject.src()
		.pipe(tsProject())
		.js.pipe(gulp.dest('dist'));
});
gulp.task('ejs', () => {
	return gulp.src('./views/**')
		.pipe(gulpCopy('./dist'));
});
gulp.task('static', () => {
	return gulp.src('./static/**')
		.pipe(gulpCopy('./dist'));
});

gulp.task('default', gulp.parallel(['ts', 'ejs', 'static']));

