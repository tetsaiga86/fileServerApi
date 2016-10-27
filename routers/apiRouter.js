var express = require('express');
var apiRouter = express.Router();
var apiHandler = require('../handlers/apiHandler');

//done:
apiRouter.get('/list/:path?', apiHandler.handleList);

apiRouter.post('/rename/:path?', apiHandler.handleRename);

apiRouter.post('/mkdir/:path', apiHandler.handleMkDir);

apiRouter.delete('/remove/:path', apiHandler.handleRemove);

//TODO:
apiRouter.post('/upload/:path?', apiHandler.handleUploadFile);

apiRouter.put('/update/:path', apiHandler.handleUpdate);

module.exports = apiRouter;
