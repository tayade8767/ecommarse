var express = require('express');
var router = express.Router();

const db = require('../config/mongooseconnection');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/owner', function(req, res, next) {
  res.send('owner');
});
router.get('/user', function(req, res, next) {
  res.send('user');
});
router.get('/product', function(req, res, next) {
  res.send('product');
});

module.exports = router;
