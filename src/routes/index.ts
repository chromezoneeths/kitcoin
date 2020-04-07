import * as express from 'express';
const router = express.Router();
import * as fs from 'fs';
import * as path from 'path';
/* GET home page. */
router.get('/', (request, response) => {
	response.end(fs.readFileSync(path.join(__dirname, 'public/index.html')));
});

export default router;
