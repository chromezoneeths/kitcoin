import * as express from 'express';
const router = express.Router();

/* GET users listing. */
router.get('/', (request, response) => {
	response.send('respond with a resource');
});

export default router;
