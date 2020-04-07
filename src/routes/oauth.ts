import * as express from 'express';
import * as fs from 'fs';
const oauthRouter = express.Router();

import * as google from '../google';

oauthRouter.get('/oauthstage1', (request, response) => {
	google.callback(request, response, '/oauthstage1');
});
oauthRouter.get('/oauthstage2', (request, response) => {
	google.callback(request, response, '/oauthstage2');
});
oauthRouter.get('/oauthstage3', (request, response) => {
	console.log(request.url);
	google.callback(request, response, request.url);
});
oauthRouter.get('/stage1.js', (request, response) => {
	response.end(fs.readFileSync('clientJs/stage1.js'));
});
oauthRouter.get('/stage2.js', (request, response) => {
	response.end(fs.readFileSync('clientJs/stage2.js'));
});

export default oauthRouter;

