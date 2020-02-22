const express = require('express');
const oauthRouter = express.Router();

const google = require('./google.js');
const fs = require('fs');

oauthRouter.get('/oauthstage1', (req, res, next) => {
	google.callback(req, res, '/oauthstage1');
});
oauthRouter.get('/oauthstage2', (req, res, next) => {
	google.callback(req, res, '/oauthstage2');
});
oauthRouter.get('/oauthstage3', (req, res, next) => {
	console.log(req.url);
	google.callback(req, res, req.url);
});
oauthRouter.get('/stage1.js', (req, res, next) => {
	res.end(fs.readFileSync('clientjs/stage1.js'));
});
oauthRouter.get('/stage2.js', (req, res, next) => {
	res.end(fs.readFileSync('clientjs/stage2.js'));
});