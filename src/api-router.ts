import * as express from 'express';
import * as db from './db';
import * as userActions from './user';
import {Request} from 'express-serve-static-core';
const router = express.Router();

/* GET home page. */
router.get('/', async (request, response) => {
	const user = await session(request);
	if (user) {
		const message = request.body;
		const info: userActions.Info = {
			name: user.name,
			address: user.address,
			id: user.uuid,
			role: user.role,
			auth: false
		};
		if (typeof userActions[message.action] === 'function') {
			const result = await userActions[message.action](info, message);
			response.end(JSON.stringify(result));
		} else {
			response.sendStatus(404);
			response.end();
		}
	} else if (request.headers.authorization) {
		response.send('bad-session');
	} else {
		response.send('no-session');
	}
});

router.get('/check', async (request, response) => {
	console.log('Checking user’s session…');
	const user = await session(request);
	if (user !== undefined) {
		response.send(JSON.stringify({
			name: user.name,
			address: user.address,
			role: user.role
		}));
	} else if (request.headers.authorization) {
		response.send('bad-session');
	} else {
		response.send('no-session');
	}
});

export default router;

async function session(request: Request): Promise<db.User | undefined> {
	if (request.headers.authorization) {
		const session = await db.session.getBySecret(request.headers.authorization);
		if (session === undefined) {
			return;
		}

		const user = await db.user.getById(session.user);
		if (user) {
			return user;
		}
	}
}
