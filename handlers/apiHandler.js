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

  }
};

module.exports = apiHandler;
