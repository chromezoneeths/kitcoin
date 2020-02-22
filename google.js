// This file contains abstractions for Google APIs.
const conf = require('./config'); // Gotta have them inconsistent semicolons amirite
const uuid = require('uuid/v4');
const urllib = require('url');
const db = require('./db');
const oauthKeys = require('./oauth_info'); // This won't be in the repository; make your own keys in the Google Developer Console.
const oauthScopes = [
	'https://www.googleapis.com/auth/userinfo.email',
	'https://www.googleapis.com/auth/userinfo.profile',
	'https://www.googleapis.com/auth/classroom.courses.readonly',
	'https://www.googleapis.com/auth/classroom.rosters.readonly',
	'https://www.googleapis.com/auth/classroom.profile.emails'
];
const {
	google
} = require('googleapis');
const pendingOAuthCallbacks = [];
exports.prepare = socket => { // Blocks until user consents, otherwise doesn't do anything
	return new Promise(resolve => {
		const oAuthClient = new google.auth.OAuth2(
			oauthKeys.clientId,
			oauthKeys.clientSecret,
			`${conf.oauthCallbackUrl}/oauthstage2`
		);
		async function h (raw) {
			const message = JSON.parse(raw);
			switch (message.action) {
				case "google": { // User doesn't have a secret and wants to sign in with Google
					const thisOAuthID = uuid();
					const thisPendingOAuth = {
						id: thisOAuthID,
						reslve: resolve,
						client: oAuthClient
					};
					const url = `${conf.oauthCallbackUrl}/oauthstage1#${JSON.stringify({
						redirect: oAuthClient.generateAuthUrl({
							scope: oauthScopes,
							access_type: 'online'
						}),
						uuid: thisOAuthID
					})}`;
					pendingOAuthCallbacks.push(thisPendingOAuth);
					console.log(`Sending login message ${thisOAuthID}`);
					socket.send(JSON.stringify({
						action: 'login',
						url
					}));
					break;
				}
				case "secret": { // If the user wants to use their secret to use an existing session
					const refresh = await db.getSession(message.secret);
					if (!refresh) { // If there is no token found in database for secret
						socket.send(JSON.stringify({
							action: 'secret',
							result: false
						}));
						socket.once('message', h);
					} else { // If the session is present, load it and tell the user to continue.
						oAuthClient.setCredentials({
							refresh_token: refresh
						});
						socket.send(JSON.stringify({
							action: 'secret',
							result: true
						}));
						oauth2Client.once('tokens', (tokens) => {
							if (tokens.refresh_token) {
								resolve({
									refresh: tokens.refresh_token,
									auth: tokens.access_token
								});
							}
						});
					}
					break;
				}
				default:
					console.error("user fricked up");
			}
		}
		socket.once('message', h);
	});
};

exports.callback = async (req, res, url) => {
	console.log(`OAUTH ROUTER GET ${url}`);
	if (url.startsWith('/oauthstage1')) {
		res.writeHead(200);
		res.end('<script src="stage1.js"></script>');
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
		res.writeHead(200);
		res.end('<script src="stage2.js"></script>');
	} else if (url.startsWith('/oauthstage3')) {
		const qs = new urllib.URL(url, conf.oauthCallbackUrl)
			.searchParams;
		for (const i in pendingOAuthCallbacks) {
			if (pendingOAuthCallbacks[i].id == qs.get('uuid')) {
				const {
					tokens
				} = await pendingOAuthCallbacks[i].client.getToken(qs.get('code'));
				res.writeHead(200);
				res.end('<script>setTimeout(()=>{window.close()},300)</script>');
				pendingOAuthCallbacks[i].client.credentials = tokens;
				pendingOAuthCallbacks[i].reslve({
					auth: pendingOAuthCallbacks[i].client
				});
			}
		}
	}
};

exports.getCourses = classroom => {
	return new Promise(async r => {
		classroom.courses.list({
			pageSize: 0
		}, (err, res) => {
			r({
				err,
				res
			});
		});
	});
};

exports.getStudents = (classroom, id) => {
	return new Promise(async r => {
		classroom.courses.students.list({
			courseId: id,
			pageSize: 0
		}, (err, res) => {
			r({
				err,
				res
			});
		});
	});
};