const gulp = require('gulp');
const ts = require('gulp-typescript');
const tsProject = ts.createProject('tsconfig.json');
const gulpCopy = require('gulp-copy');
const {watch} = require('gulp');

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

gulp.task('watch', () => {
	watch('src/**.ts', gulp.series('ts'));
	watch('views/**', gulp.series('ejs'));
	watch('./static/**', gulp.series('static'));
});

