// This file contains abstractions for Google APIs.
import * as conf from './config';
import {v4 as uuid} from 'uuid';
import * as urllib from 'url';
import * as db from './db';
const oauthKeys = {
	clientId: process.env.OAUTH_CLIENT_ID,
	clientSecret: process.env.OAUTH_CLIENT_SECRET
};
const oauthScopes = [
	'https://www.googleapis.com/auth/userinfo.email',
	'https://www.googleapis.com/auth/userinfo.profile',
	'https://www.googleapis.com/auth/classroom.courses.readonly',
	'https://www.googleapis.com/auth/classroom.rosters.readonly',
	'https://www.googleapis.com/auth/classroom.profile.emails'
];
import {google} from 'googleapis';
import {Response, Request} from 'express';
import WebSocket from 'ws';
const pendingOAuthCallbacks = [];

interface OAuthInfo {
	refresh: string;
	auth: any;
}

export async function prepare(socket: WebSocket): Promise<OAuthInfo> {
	return new Promise(resolve => { // Can't use fancy ES6 stuff here since I need to pass the resolve function around
		const oAuthClient = new google.auth.OAuth2(
			oauthKeys.clientId,
			oauthKeys.clientSecret,
			`${conf.oauthCallbackUrl}/oauthstage2`
		);
		async function h(raw: string): Promise<void> {
			const message = JSON.parse(raw);
			switch (message.action) {
				case 'google': { // User doesn't have a secret and wants to sign in with Google
					const thisOAuthID: string = uuid();
					const thisPendingOAuth = {
						id: thisOAuthID,
						reslve: resolve,
						client: oAuthClient
					};
					const url = `${conf.oauthCallbackUrl}/oauthstage1#${encodeURI(JSON.stringify({
						redirect: oAuthClient.generateAuthUrl({
							scope: oauthScopes,
							access_type: 'offline'
						}),
						uuid: thisOAuthID
					}))}`;
					pendingOAuthCallbacks.push(thisPendingOAuth);
					console.log(`Sending login message ${thisOAuthID}`);
					socket.send(JSON.stringify({
						action: 'login',
						url
					}));
					break;
				}

				case 'secret': { // If the user wants to use their secret to use an existing session
					const refresh = (await db.getSession(message.secret).catch(() => {
						return {token: ''};
					}));
					console.log(refresh)
					if (refresh.token === '') { // If there is no token found in database for secret, tell the user to discard it.
						socket.send(JSON.stringify({
							action: 'secret',
							result: false
						}));
						socket.once('message', h);
					} else { // If the session is present, load it and tell the user to continue.
						oAuthClient.setCredentials({
							refresh_token: refresh.token
						});
						socket.send(JSON.stringify({
							action: 'secret',
							result: true
						}));
						resolve({
							auth: oAuthClient,
							refresh: refresh.token
						})

						// oAuthClient.once('tokens', tokens => {
						// 	if (tokens.refresh_token) {
						// 		resolve({
						// 			refresh: tokens.refresh_token,
						// 			auth: tokens.access_token
						// 		});
						// 	}
						// });
					}

					break;
				}

				default:
					console.error('user fricked up');
			}
		}

		socket.once('message', h);
	});
}

export async function callback(request: Request, response: Response, url: string): Promise<void> {
	console.log(`OAUTH ROUTER GET ${url}`);
	if (url.startsWith('/oauthstage1')) {
		response.writeHead(200);
		response.end('<script src="stage1.js"></script>');
		// Const qs = new url.URL(req.url, conf.oauthCallbackUrl)
		//       .searchParams;
		// for(var i in pendingOAuthCallbacks){
		//   if(pendingOAuthCallbacks[i].id == qs.get(`uuid`)){
		//     console.log(`Received login message ${pendingOAuthCallbacks[i].id}`);
		//     const {tokens} = await pendingOAuthCallbacks[i].client.getToken(qs.get('code'));
		//     res.writeHead(200)
		//     res.end("<script>setTimeout(()=>{window.close()},300)</script>")
		//     pendingOAuthCallbacks[i].client.credentials = tokens
		//     pendingOAuthCallbacks[i].reslve({auth:pendingOAuthCallbacks[i].client})
		//   }
		// }
	} else if (url.startsWith('/oauthstage2')) {
		response.writeHead(200);
		response.end('<script src="stage2.js"></script>');
	} else if (url.startsWith('/oauthstage3')) {
		const qs = new urllib.URL(url, conf.oauthCallbackUrl)
			.searchParams;
		for (const i of pendingOAuthCallbacks) {
			if (i.id === qs.get('uuid')) {
				const {tokens} = await i.client.getToken(qs.get('code'));
				// console.log(tokens);
				response.writeHead(200);
				response.end('<script>setTimeout(()=>{window.close()},300)</script>');
				i.client.setCredentials(tokens);
				i.reslve({
					auth: i.client,
					refresh: tokens.refresh_token
				});
			}
		}
	}
}

export async function getCourses(classroom): Promise<any> {
	classroom.courses.list({
		pageSize: 0
	}, (err, response) => {
		return {
			err,
			res: response
		};
	});
}

export async function getStudents(classroom, id): Promise<serverResponse> {
	return new Promise(resolve => classroom.courses.students.list({
		courseId: id,
		pageSize: 0
	}, (err, response) => {
		resolve({
			err,
			res: response
		});
	}));
}

interface serverResponse {
	err;
	res;
}
