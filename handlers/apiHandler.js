const fileSystem = require('../models/fileSystem');
const formidable = require('express-formidable');

var apiHandler = {
  handleList: function (req, res) {
    var path;
    if(req.params.path){
      path = fileSystem.sanitizedPath(req.params.path);
      //console.log(`${path} is clean`);
    } else {
      path = req.params.path;
      //console.log(`${path} doesn't exist`);
    }
    fileSystem.getChildList(path).then(function(children){
      res.json(children);
    })
    .catch(function(error){
      console.error(error);
    });
  },

  handleDownload: function(req, res){
    var path = fileSystem.sanitizedPath(req.params.path);
    try{
      var file = fileSystem.getFileBytes(path);
      res.setHeader('Content-Length', file.length);
      res.writeHead(200);
      res.write(file, 'binary');
      res.end();
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
