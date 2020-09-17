var express = require('express');
var router = express.Router();
const passport = require('passport');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('main', {
    user: req.user//로그인된 사용자.
  });
});

module.exports = router;
