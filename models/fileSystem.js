const fs = require('fs');
const root = 'C:/Users/Kyle/Music/';
var Promise = require('es6-promise').Promise;

var _isDescendantOfRoot = function(path) {
  return true;
  // returns bool
  // TODO: implement this
};

var _isPathEqual = function(path1, path2) {
  return true;
  // returns bool
  // TODO: implement this
};

var _isWritablePath = function(path) {
  // returns bool
  // TODO: implement this
  return true;
};

var _isDeletablePath = function(path) {
  return true;
  // TODO: implement this
};

function _isReadablePath(path) {
  return true;
  // TODO: implement this
}

var fileSystem = {
  getChildList: function(dir){
    //TODO: clear ending '/' from dir
    return new Promise(function(resolve, reject) {
      fs.stat(root + (dir || ''), (err, stats) => {
        if (err) return reject(err);
        if (!stats.isDirectory()) {
          return reject('Item at given path is not a directory.');
        }
        fileNames = filteredFileList(root + (dir || ''));
        resolve(
          fileNames.map(
            fileName => {
              return decorateFile(root + (dir || '') + fileName);
            }
          )
        );
      });
    });
  },
  uploadFile: function(dir, newFile){
    var source = newFile.path;
    var destination = root + dir;
    fs.rename(newFile.path, destination, function(err){
      if(err) return console.log(err + '');
      console.log(newFile.path + ' will be moved to ' + root + dir);
    });
  },

  rename: function(dir, newName){
    var source = root + (dir || '');
    var destination = root + newName;

    if (!_isWritablePath(destination)) {
      throw `Destination not writable: ${destination}`;
    }
    fs.rename(source, destination, function(){

    });
  },

  mkDir: function (dir) {
    fs.mkdirSync(root + (dir || ''));
  },

  update: function (dir, updatedFile){

  },

  remove: function (dir) {
    fs.stat(root + dir, (err, stats) => {
      try{
        stats = decorateFile(root + dir);
        if (!stats.isDir) {
          fs.unlink(root + dir, function (e){
            if (e) return console.error(e);
            return console.log('the file at ' + root + dir + ' has been deleted');
          });
        }else if (stats.childCount < 1) {
          fs.rmdir(root + dir, function (e){
            if (e) return console.error(e);
            return console.log('the empty folder at ' + root + dir + ' has been deleted');
          });
        }else{
          if(decorateFile(root).ino != decorateFile(root + (dir || '')).ino){
            rmdirRecursive(root + dir, function (e) {
              if (e) return console.error(e);
            });
            return console.log('the folder ' + root + dir + ' and all inner files have been deleted');

          }
        }
      }catch(err){
        console.log(err + '');
      }
    });
  }
};

function filteredFileList(path) {
  return fs.readdirSync(path).filter((name) => name !== 'desktop.ini');
}

function decorateFile(path) {
  var fileStats = fs.statSync(path);
  fileStats.path = path;
  fileStats.isDir = fileStats.isDirectory();
  if(fileStats.isDir) fileStats.childCount = filteredFileList(path).length;
  var splitPath = path.split('/');
  var length = splitPath.length;
  fileStats.name = splitPath[length - 1];
  return fileStats;
  //return fs.statSync(path);
}

function rmdirRecursive(path, callback) {
  fs.readdir(path, function(err, files) {
    if(err) {
			// Pass the error on to callback
      callback(err, []);
      return;
    }
    var wait = files.length,
      count = 0,
      folderDone = function(err) {
        count++;
			// If we cleaned out all the files, continue
        if( count >= wait || err) {
          fs.rmdir(path,callback);
        }
      };
		// Empty directory to bail early
    if(!wait) {
      folderDone();
      return;
    }

		// Remove one or more trailing slash to keep from doubling up
    path = path.replace(/\/+$/,'');
    files.forEach(function(file) {
      var curPath = path + '/' + file;
      fs.lstat(curPath, function(err, stats) {
        if( err ) {
          callback(err, []);
          return;
        }
        if( stats.isDirectory() ) {
          rmdirRecursive(curPath, folderDone);
        } else {
          fs.unlink(curPath, folderDone);
        }
      });
    });
  });
};

module.exports = fileSystem;
