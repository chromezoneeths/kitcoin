var express = require('express');
var router = express.Router();
const fs = require('fs');
const path = require('path');
/* GET home page. */
router.get('/', function(req, res, next) {
  res.end(fs.readFileSync(path.join(__dirname, 'public/index.html')))
});

module.exports = router;
