import * as express from 'express';
import * as fs from 'fs';
const router = express.Router();

import * as google from '../google';

router.get('/oauthstage1', (request, response) => {
	google.callback(request, response, '/oauthstage1');
});
router.get('/oauthstage2', (request, response) => {
	google.callback(request, response, '/oauthstage2');
});
router.get('/oauthstage3', (request, response) => {
	console.log(request.url);
	google.callback(request, response, request.url);
});
router.get('/stage1.js', (request, response) => {
	response.end(fs.readFileSync('clientJs/stage1.js'));
});
router.get('/stage2.js', (request, response) => {
	response.end(fs.readFileSync('clientJs/stage2.js'));
});

export default router;

