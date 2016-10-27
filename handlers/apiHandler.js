const fileSystem = require('../models/fileSystem');
const formidable = require('express-formidable');

var apiHandler = {
  handleList: function (req, res) {
    var path = req.params.path;
    fileSystem.getChildList(path).then(function(children){
      res.json(children);
    })
    .catch(function(error){
      console.error(error);
    });
  },

// TODO: upload already overrites, so update seems redundant
  handleUpdate: function(req, res) {
    var path = req.params.path;
    try{
      fileSystem.update(path);
      res.writeHead(202);
      res.end('try completed for:\n the file ' + path + ' has been updated');
    }catch(e){
      res.writeHead(500);
      res.end(e + '');
    }
  },

  handleRename: function (req, res) {
    var path = req.params.path;
    var newPath = req.fields.newPath;
    try{
      fileSystem.rename(path, newPath);
      res.writeHead(202);
      res.end('try completed for:\n the file ' + path + ' has been renamed to ' + newPath);
    }catch(e){
      res.writeHead(500);
      res.end(e + '');
    }
  },

  handleUploadFile: function (req, res) {
    var newFile = req.files.fileData;
    var path = req.params.path;
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
    var path = req.params.path;
    try{
      fileSystem.remove(path);
      res.writeHead(202);
      res.end('try completed for:\n folder ' + path + ' deleted');
    }catch(e){
      res.writeHead(500);
      res.end(e + '');
    }
  },

  handleMkDir: function (req, res) {
    var path = req.params.path;
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
