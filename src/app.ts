// RUN bin/www OR IT WILL BREAK

// TODO: Someone who knows more about express document this

if (!module.parent) {
	throw new Error('no, bad'); // Prevents me from forgetting about bin/www and making that mistake again
}

import createError from 'http-errors';
const express = require('express');
import * as path from 'path';
import cookieParser from 'cookie-parser';
import bodyParser from 'body-parser';
const logger = require('morgan');
import oauthRouter from './routes/oauth';
import usersRouter from './routes/users';
import indexRouter from './routes/index';
import ApiRouter from './api-router';

const app = express();

// View engine setup
// app.set('views', path.join(/* __dirname, */'./views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(cookieParser());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
import * as google from './google';
app.use('/oauth', oauthRouter);
app.use('/api', ApiRouter);

// Catch 404 and forward to error handler
// TODO: something in error handling is broken?
app.use((request, response, next) => {
	next(createError(404));
});

// Error handler
app.use((err, request, response, _next) => {
	// Set locals, only providing error in development
	response.locals.message = err.message;
	response.locals.error = request.app.get('env') === 'development' ? err : {};

	// Render the error page
	response.status(err.status	|| 500);
	response.render('pages/error');
});

// Bits added to the end for the backend, probably awful and wrong.

const googleapis = require('googleapis').google;
const conf = require('./config');
import * as db from './db';
import * as userActions from './user';
import * as adminActions from './admin';
import {v4 as uuid} from 'uuid';
import WebSocket from 'ws';
import {Request} from 'express';
async function init(): Promise<void> {
	await db.init().catch((error: Error) => {
		throw error;
	});
}

console.log(conf);

init();

async function session(ws: WebSocket, _request: Request): Promise<void> {
	console.log('Got new connection');

	const googleCancelEvents: Array<() => void> = [];

	ws.on('close', async () => {
		console.log(`RECORDS, LOGGING: User ${name} has disconnected.`);
		if (ping) {
			clearInterval(ping);
		}

		googleCancelEvents.forEach(f => f());
	});

	const auth = await google.prepare(ws, (cancel: () => void) => {
		googleCancelEvents.push(cancel);
	});
	const peopleAPI = googleapis.people({
		version: 'v1',
		auth: auth.auth
	});
	const user = await peopleAPI.people.get({
		resourceName: 'people/me',
		personFields: 'emailAddresses,names'
	});
	console.log(`RECORDS, LOGGING: User ${user.data.names[0].displayName} has connected with email ${user.data.emailAddresses[0].value}.`);
	const userQuery = await db.user.getByAddress(user.data.emailAddresses[0].value).catch(() => {
		return undefined;
	});

	let userID: string;
	let address: string;
	let name: string;
	let role: db.Permission;
	const ping = setInterval(() => {
		ws.send(JSON.stringify({action: 'ping'}));
	}, 500);
	if (userQuery) {
		userID = userQuery.uuid;
		address = userQuery.address;
		role = userQuery.role;
		role = userQuery.role;
	} else {
		userID = uuid();
		await db.user.add(userID, user.data.emailAddresses[0].value, user.data.names[0].displayName).catch(error => {
			console.log(`RECORDS, ERROR: ${error}`);
		});
	}

	const info: userActions.Info = {
		auth: auth.auth,
		name,
		id: userID,
		role,
		address
	};

	ws.send(JSON.stringify({
		action: 'ready',
		name: info.name,
		email: info.address,
		balance: db.user.balance(info.id)
	}));
	ws.on('message', async (stringMessage: string) => {
		const message = JSON.parse(stringMessage);
		if (message.action === 'elevate' && user.role === db.Permission.admin && conf.enableRemote && typeof adminActions[message.action] === 'function') {
			const result = await adminActions[message.procedure](info, message);
			ws.send(JSON.stringify(result));
		} else if (typeof userActions[message.action] === 'function') {
			const result = await userActions[message.action](info, message);
			ws.send(JSON.stringify(result));
		} else {
			ws.send(JSON.stringify({
				action: `${message.action}Response`,
				status: 'unknown'
			}));
		}
	}
	);
}

module.exports.app = app;
module.exports.wssessionmethod = session;
