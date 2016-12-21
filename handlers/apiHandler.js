const fileSystem = require('../models/fileSystem');
const formidable = require('express-formidable');
var url = require('url');

var isNumber = function (n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
};

var apiHandler = {
  handleList: function (req, res) {
    var path = fileSystem.sanitizedPath(req.params.path || '');
    fileSystem.getChildList(path).then(function(children){
      res.json(children);
    })
    .catch(function(error){
      console.error(error);
    });
  },

  handleDownload: function(req, res){
    console.log('req.params.path= ' + req.params.path);
    var path = fileSystem.sanitizedPath(req.params.path);
    var info = {};
    var reqUrl = url.parse(req.url, true);
    var range = typeof req.headers.range === 'string' ? req.headers.range : undefined;
    var fileSize = fileSystem.getFileSize(path);
    info.start = 0;
    info.end = fileSize - 1;
    if (range !== undefined && (range = range.match(/bytes=(.+)-(.+)?/)) !== null) {
		// Check range contains numbers and they fit in the file.
		// Make sure info.start & info.end are numbers (not strings) or stream.pipe errors out if start > 0.
      info.start = isNumber(range[1]) && range[1] >= 0 && range[1] < info.end ? range[1] - 0 : info.start;
      info.end = isNumber(range[2]) && range[2] > info.start && range[2] <= info.end ? range[2] - 0 : info.end;
      info.rangeRequest = true;
    } else if (reqUrl.query.start || reqUrl.query.end) {
		// This is a range request, but doesn't get range headers. So there.
      info.start = isNumber(reqUrl.query.start) && reqUrl.query.start >= 0 && reqUrl.query.start < info.end ? reqUrl.query.start - 0 : info.start;
      info.end = isNumber(reqUrl.query.end) && reqUrl.query.end > info.start && reqUrl.query.end <= info.end ? reqUrl.query.end - 0 : info.end;
    }
    var fileStream = fileSystem.getFileStream(path, info);
    try{
      // console.log(info.start, info.end, path);
      // res.write(file, 'binary');
      // res.end();
      if(info.end === fileSize - 1 && info.start === 0){
        res.setHeader('Content-Length', info.end - info.start + 1);
        res.writeHead(200);
      }else{
        res.setHeader('Content-Range', 'bytes ' + info.start + '-' + info.end + '/' + fileSize);
        res.writeHead(206);
      }
      fileStream.pipe(res);
    }catch(e){
      res.writeHead(500);
      res.end(e.stack);
    }
  },

  handleUpdate: function(req, res) {
    var newFile = req.files.fileData;
    var path = fileSystem.sanitizedPath(req.params.path);
    try{
      fileSystem.uploadFile(path, newFile);
      res.writeHead(202);
      res.end('try completed for:\n the file ' + path + ' has been updated');
    }catch(e){
      res.writeHead(500);
      res.end(e.stack);
    }
  },

  handleZip: function(req, res){
    var path = fileSystem.sanitizedPath(req.params.path);
    // var newPath = fileSystem.sanitizedPath(req.params.newPath);
    try{
      // var promise = fileSystem.zip(...);
      // promise.then(function(){});
      // promise.catch(function(){});
      fileSystem.zip(path)
        .then(function(value) {
          res.setHeader('Content-Disposition', 'inline; filename=' + path + '.zip');
          res.writeHead(200);

          value.pipe(res);
          // res.writeHead(202);
          // res.end('try completed for:\n the file ' + path + ' has been renamed to ' + newPath);
          // TODO : do stuff with success value
        })
        .catch(function(value) {
          res.writeHead(500);
          res.end(e.stack);
          // TODO : do stuff with error value
        });

    }catch(e){
      res.writeHead(500);
      res.end(e.stack);
    }
  },

  handleRename: function (req, res) {
    var path = fileSystem.sanitizedPath(req.params.path);
    var newPath = fileSystem.sanitizedPath(req.fields.newPath);
    try{
      fileSystem.rename(path, newPath);
      res.writeHead(202);
      res.end('try completed for:\n the file ' + path + ' has been renamed to ' + newPath);
    }catch(e){
      res.writeHead(500);
      res.end(e.stack);
    }
  },

  handleUploadFile: function (req, res) {
    var newFile = req.files.fileData;
    var path = fileSystem.sanitizedPath(req.params.path);
    try{
      fileSystem.uploadFile(path, newFile);
      res.writeHead(202);
      res.end('try completed for:\n upload file ' + path);
    }catch(e){
      res.writeHead(500);
      res.end(e.stack);
    }
  },

  handleRemove: function (req, res) {
    var path = fileSystem.sanitizedPath(req.params.path);
    try{
      fileSystem.remove(path);
      res.writeHead(202);
      res.end('try completed for:\n folder ' + path + ' deleted');
    }catch(e){
      res.writeHead(500);
      res.end(e.stack);
    }
  },

  handleMkDir: function (req, res) {
    var path = fileSystem.sanitizedPath(req.params.path);
    try{
      fileSystem.mkDir(path);
      res.writeHead(201);
      res.end('try completed for:\n ' + path + ' folder created');
    }catch(error){
      res.writeHead(500);
      res.end(error + '');
    }
  }
};

module.exports = apiHandler;
