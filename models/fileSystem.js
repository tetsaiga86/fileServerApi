const fs = require('fs');
const root = 'C:/Users/Kyle/Music/'
var Promise = require('es6-promise').Promise;
var mkdirInput = '';

var fileSystem = {
  getChildList: function(dir){
    //TODO: clear ending '/' from dir
    return new Promise(function(resolve, reject) {
      fs.stat(root+(dir||''), (err, stats) => {
        if (err) return reject(err);
        if (!stats.isDirectory()) {
          return reject('Item at given path is not a directory.')
        }
        fileNames=filteredFileList(root+(dir||''));
        resolve(
          fileNames.map(
            fileName => {
              return decorateFile(root+(dir||'')+fileName);
            }
          )
        );
      });
    });
  },

  mkDir: function (dir) {
    fs.mkdirSync(root+(dir||''));  
  }
};

function filteredFileList(path) {
  return fs.readdirSync(path).filter((name) => name !== 'desktop.ini')
}

function decorateFile(path) {
  var fileStats = fs.statSync(path);
  fileStats.path = path;
  fileStats.isDirectory = fileStats.isDirectory();
  if(fileStats.isDirectory) fileStats.childCount = filteredFileList(path).length;
  var splitPath = path.split('/');
  var length = splitPath.length;
  fileStats.name = splitPath[length-1];
  return fileStats;
  //return fs.statSync(path);
}

module.exports = fileSystem;
