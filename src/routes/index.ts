// RUN bin/www OR IT WILL BREAK

if (!module.parent) {
	throw new Error('no, bad');
}

import * as express from 'express';
const router = express.Router();
// Import * as fs from 'fs';
// import * as path from 'path';

const pages = {
	pages: [
		{
			name: 'Wallet',
			path: '/wallet',
			student: true,
			teacher: false
		},
		{
			name: 'Earn',
			path: '/earn',
			student: true,
			teacher: false
		},
		{
			name: 'Store',
			path: '/rewards',
			student: false,
			teacher: true
		},
		{
			name: 'History',
			path: '/staff/history',
			student: true,
			teacher: true
		},
		{
			name: 'Rewards',
			path: '/staff/rewards',
			student: false,
			teacher: true
		}
	]
};

/* GET home page. */
router.get('/', (request, response) => {
	// Response.end(fs.readFileSync(path.join(__dirname, 'public/index.html')));
	response.render('pages/index', {pages, current: 'Wallet', kind: 'student'});
});

export default router;
