var express = require('express');
var apiRouter = express.Router();
var apiHandler = require('../handlers/apiHandler');

apiRouter.get('/list/:path?', function(req, res) {
  apiHandler.handleList(req, res);
});

apiRouter.put('/update/:path', function(req, res) {
  apiHandler.handleUpdate(req, res);
});

apiRouter.post('/upload/:path', function (req, res) {
  apiHandler.handleUpload(req, res);
});

apiRouter.post('/mkdir/:path?', apiHandler.handleMkDir);

module.exports = apiRouter;
