import * as express from 'express';
const router = express.Router();
// Import * as fs from 'fs';
// import * as path from 'path';

const pages = require('../static/data/pages');

/* GET home page. */
router.get('/', (request, response) => {
	// Response.end(fs.readFileSync(path.join(__dirname, 'public/index.html')));
	try {
		response.render('pages/index', {pages, current: 'Wallet', kind: 'student'});
	} catch (error) {
		response.end(error);
	}
});

export default router;
