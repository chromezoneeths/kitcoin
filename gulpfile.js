const gulp = require('gulp');
const ts = require('gulp-typescript');
const tsProject = ts.createProject('tsconfig.json');
const del = require('del');
const path = require('path');
const jest = require('gulp-jest').default;
const compose = require('docker-compose');

gulp.task('default', () => {
	return tsProject.src()
		.pipe(tsProject())
		.js.pipe(gulp.dest('dist'));
});

gulp.task('clean-tests', ()=>{
	return del('test_data/**');
})

gulp.task('test-up', ()=>{
	return compose.upAll({
		cwd: path.join(__dirname),
		log: true,
		composeOptions: ['-f', './docker-compose.test.yml'],
		commandOptions: ['--build']
	})
})

gulp.task('test-down', ()=>{
	return compose.down()
})

gulp.task('jest', ()=>{
	return gulp.src('./tests').pipe(jest())
})

gulp.task('test', gulp.series('clean-tests', 'test-up', 'jest', 'test-down'))