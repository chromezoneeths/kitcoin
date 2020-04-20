import * as express from 'express';
import * as db from './db';
import * as userActions from './user';
const router = express.Router();

/* GET home page. */
router.get('/api', async (request, response) => {
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
	} else {
		response.sendStatus(401);
		response.end();
	}
});

export default router;

async function session(request): Promise<db.User|false> {
	if (request.headers.authorization) {
		const secret = await db.session.getBySecret(request.headers.authorization);
		const user = await db.user.getById(secret.user);
		if (user) {
			return user;
		}

		return false;
	}

	return false;
}
