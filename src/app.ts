import createError from 'http-errors';
const express = require('express');
import * as path from 'path';
import cookieParser from 'cookie-parser';
import {v4 as uuid} from 'uuid';
const logger = require('morgan');
import oauthRouter from './routes/oauth';
import usersRouter from './routes/users';
import indexRouter from './routes/index';
import cron from 'cron';

const app = express();

// View engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
import * as google from './google';
app.use('/oauth', oauthRouter);

// Catch 404 and forward to error handler
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
	response.render('error');
});

// Bits added to the end for the backend, probably awful and wrong.

const googleapis = require('googleapis').google;
import * as conf from './config';
import * as db from './db';
import * as ad from './admin';
import WebSocket from 'ws';
async function init(): Promise<void> {
	await db.init().catch((error: Error) => {
		throw error;
	});
}

init();

async function session(ws: WebSocket): Promise<void> {
	console.log('Got new connection');

	ws.on('close', async () => {
		console.log(`RECORDS, LOGGING: User ${name} has disconnected.`);
		if (ping) {
			clearInterval(ping);
		}
	});

	const auth = await google.prepare(ws);
	const peopleAPI = googleapis.people({
		version: 'v1',
		auth: auth.auth
	});
	const classroomAPI = googleapis.classroom({
		version: 'v1',
		auth: auth.auth
	});
	const user = await peopleAPI.people.get({
		resourceName: 'people/me',
		personFields: 'emailAddresses,names'
	});
	console.log(`RECORDS, LOGGING: User ${user.data.names[0].displayName} has connected with email ${user.data.emailAddresses[0].value}.`);
	const userQuery = await db.getUserByAddress(user.data.emailAddresses[0].value).catch(() => {
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
		name = userQuery.name;
		role = userQuery.role;
	} else {
		userID = uuid();
		role = db.Permission.student;
		await db.addUser(userID, user.data.emailAddresses[0].value, user.data.names[0].displayName).catch(error => {
			console.log(`RECORDS, ERROR: ${error}`);
		});
		address = user.data.emailAddresses[0].value;
		name = user.data.names[0].displayName;
	}

	ws.send(JSON.stringify({
		action: 'ready',
		name,
		email: address,
		balance: db.getBalance(userID)
	}));
	ws.on('message', async (stringMessage: string) => {
		const message = JSON.parse(stringMessage);
		switch (message.action) {
			case 'getBalance': {
				const balance = await db.getBalance(userID);
				ws.send(JSON.stringify({
					action: 'balance',
					balance
				}));
				break;
			}

			case 'sendCoin': {
				const targetAddress = message.target;
				let isBalanceSufficient;
				let target;
				const balance = await db.getBalance(userID);
				isBalanceSufficient = balance > message.amount;
				target = await db.getUserByAddress(targetAddress)
				if (message.amount !== parseInt(message.amount, 10) || !/[A-Za-z\d]*@[A-Za-z\d]*\.[a-z]{3}/.test(message.target)) {
					ws.send(JSON.stringify({
						action: 'sendResponse',
						status: 'badInput'
					}));
				} else if (isBalanceSufficient && target) {
					await db.addTransaction(userID, target.uuid, message.amount);
					ws.send(JSON.stringify({
						action: 'sendResponse',
						status: 'ok'
					}));
				} else if (target === undefined) {
					ws.send(JSON.stringify({
						action: 'sendResponse',
						status: 'nonexistentTarget'
					}));
				} else if (!isBalanceSufficient) {
					ws.send(JSON.stringify({
						action: 'sendResponse',
						status: 'insufficientBalance'
					}));
				}

				break;
			}

			case 'mintCoin': {
				if (message.amount !== parseInt(message.amount, 10)) {
					ws.send(JSON.stringify({
						action: 'mintResponse',
						status: 'badInput'
					}));
				} else if ([db.Permission.admin, db.Permission.teacher].includes(role)) {
					await db.addTransaction('nobody', userID, message.amount);
					ws.send(JSON.stringify({
						action: 'mintResponse',
						status: 'ok'
					}));
				} else {
					ws.send(JSON.stringify({
						action: 'mintResponse',
						status: 'denied'
					}));
					console.log(`RECORDS, WARNING: UNAUTHORIZED USER ${name} ATTEMPTS TO MINT ${message.amount}`);
				}

				break;
			}

			case 'voidCoin': {
				if (message.amount !== parseInt(message.amount, 10)) {
					ws.send(JSON.stringify({
						action: 'voidResponse',
						status: 'badInput'
					}));
				} else if ([db.Permission.admin, db.Permission.teacher].includes(role)) {
					await db.addTransaction(userID, 'nobody', message.amount);
					ws.send(JSON.stringify({
						action: 'voidResponse',
						status: 'ok'
					}));
				} else {
					ws.send(JSON.stringify({
						action: 'voidResponse',
						status: 'denied'
					}));
					console.log(`RECORDS, WARNING: UNAUTHORIZED USER ${name} ATTEMPTS TO VOID ${message.amount}`);
				}

				break;
			}

			case 'getClasses': {
				if ([db.Permission.admin, db.Permission.teacher].includes(role)) {
					const result = await google.getCourses(classroomAPI);
					const {courses} = result.res.data;
					if (result.err || courses.length === 0) {
						ws.send(JSON.stringify({
							action: 'getClassesResponse',
							status: 'ServerError',
							err: result.err
						}));
					} else {
						ws.send(JSON.stringify({
							action: 'getClassesResponse',
							status: 'ok',
							classes: courses
						}));
					}
				} else {
					ws.send(JSON.stringify({
						action: 'getClassesResponse',
						status: 'denied'
					}));
				}

				break;
			}

			case 'getStudents': {
				if ([db.Permission.admin, db.Permission.teacher].includes(role)) {
					const result = await google.getStudents(classroomAPI, message.classID);
					if (result.err) {
						ws.send(JSON.stringify({
							action: 'getStudentsResponse',
							status: 'ServerError',
							err: result.err
						}));
					} else {
						console.log(result.res.data);
						const {students} = result.res.data;
						ws.send(JSON.stringify({
							action: 'getStudentsResponse',
							status: 'ok',
							students
						}));
					}
				} else {
					ws.send(JSON.stringify({
						action: 'getStudentsResponse',
						status: 'denied'
					}));
				}

				break;
			}

			case 'secret': {
				console.log(auth)
				ws.send(JSON.stringify({
					action: 'secret',
					secret: await db.addSession(userID, auth.refresh)
				}))
				break;
			}

			case 'oauthInfo': { break; }
			case 'elevate': {
				if (role !== db.Permission.admin || !conf.enableRemote) {
					console.log(`RECORDS, WARNING: UNAUTHORIZED USER ${name} ATTEMPTS ELEVATED ACTION ${message.procedure} WITH BODY ${message.body}`);
					ws.send(JSON.stringify({
						action: 'elevateResult',
						status: 'denied'
					}));
				} else {
					console.log(`RECORDS, LOGGING: USER ${name} EXECUTES ELEVATED ACTION ${message.procedure} WITH BODY ${message.body}`);
					ad.handle(message, ws).catch(error => {
						ws.send(JSON.stringify({
							action: 'elevateResult',
							status: 'error',
							contents: error
						}));
					});
				}

				break;
			}

			case 'pong': { break; }
			default:
				console.error(`RECORDS, WARNING: User ${name} attempts invalid action ${message.action}.`);
		}
	}
	);
}

module.exports.app = app;
module.exports.wssessionmethod = session;

// Explicitly handle SIGINT since docker treats node as init and won't kill it otherwise
process.on('SIGINT', () => {
	// It doesn't output anything, but it will die after a few seconds like it should.
	process.exit();
});

// Automatically restart at midnight to prevent any memory leakage over time
{
	const job = new cron.CronJob('0 0 * * *', () => {
		process.kill(process.pid, 'SIGINT');
	});
	job.start();
}
