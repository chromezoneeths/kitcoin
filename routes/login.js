var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function (req, res, next) {
    res.render('login', {
        title: 'Login',
        layout: false
    });
});

router.get('/logout', function (req, res, next) {
    res.render('logout', {
        title: 'Log Out',
        layout: false
    });
});

module.exports = router;