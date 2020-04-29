const gulp = require('gulp');
const ts = require('gulp-typescript');
const tsProject = ts.createProject('tsconfig.json');
const gulpCopy = require('gulp-copy');
const {watch} = require('gulp');
const xo = require('gulp-xo');

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
gulp.task('lint', () => {
	return gulp.src('**.*s') // All *script files
		.pipe(xo())
		.pipe(xo.format())
		.pipe(xo.results(results => {
			console.log(`Linting finished with ${results.warningCount} warnings and ${results.errorCount} errors.`);
		}));
});

gulp.task('default', gulp.parallel(['ts', 'ejs', 'static']));

gulp.task('watch', () => {
	watch('src/**.ts', gulp.series('lint', 'ts'));
	watch('views/**', gulp.series('lint', 'ejs'));
	watch('./static/**', gulp.series('lint', 'static'));
});

