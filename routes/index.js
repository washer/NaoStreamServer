const express = require('express');
const router  = express.Router();
const config  = require('../configs/stream_config.json');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { port: config.websocket_port || 8084 });
});

module.exports = router;
