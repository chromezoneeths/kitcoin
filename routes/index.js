const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
/* GET home page. */
router.get('/', (req, res, next) => {
	res.end(fs.readFileSync(path.join(__dirname, 'public/index.html')));
});

module.exports = router;
