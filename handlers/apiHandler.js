fileSystem = require('../models/fileSystem');

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
  handleUpdate: function(req, res) {

  },
  handleUpload: function (req, res) {

  },
  handleMkDir: function (req, res) {
    var path = req.params.path;
    try{
      fileSystem.mkDir(path);
      res.writeHead(201);
      res.end('folder created');
    }catch(error){
      res.writeHead(500);
      res.end(error + '');
    }
  }
};

module.exports = apiHandler;
