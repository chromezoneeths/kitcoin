const gulp = require('gulp');
const ts = require('gulp-typescript');
const tsProject = ts.createProject('tsconfig.json');
const gulpCopy = require('gulp-copy');
const {watch} = require('gulp');
const xo = require('gulp-xo');
const {exec} = require('child_process');
const sourcemaps = require('gulp-sourcemaps');

gulp.task('ts', () => {
	return tsProject.src()
		.pipe(sourcemaps.init())
		.pipe(tsProject())
		.pipe(sourcemaps.write())
		.pipe(gulp.dest('dist'));
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
gulp.task('restart', async cb => {
	const up = await new Promise(resolve => {
		exec('docker-compose top', (err, stdout) => {
			if (err) {
				console.log(err);
			}

			resolve(stdout.length > 1);
		});
	});
	if (up) {
		console.log('Kitcoin is running, rebuilding to apply changes…');
		exec('docker-compose -f docker-compose.debug.yml up --build -d', cb);
	} else {
		console.log('Kitcoin isn’t running, so we won’t start it.');
		cb();
	}
});

gulp.task('default', gulp.parallel([gulp.series('ts', 'restart'), 'ejs', 'static']));
gulp.task('ci', gulp.parallel(['ts', 'ejs', 'static']));

gulp.task('watch', () => {
	watch('src/**/*.ts', gulp.series('lint', 'ts', 'restart'));
	watch('views/**', gulp.series('lint', 'ejs'));
	watch('./static/**', gulp.series('lint', 'static'));
});

