const fs = require('fs');
const root = 'C:/Users/Kyle/Music/';
var PromiseEs6 = require('es6-promise').Promise;
var zipFolder = require('zip-folder');
var tempfile = require('tempfile');

function _sanitizedPath(path){
  var splitPath = path.split('/');
  var newPath = [];
  for (var index in splitPath) {
    if (splitPath[index] != '..') {
      newPath.push(splitPath[index]);
    }
  }
  return newPath.join('/');
}

function _isDescendantOfRoot (path) {
  try {
    var strippedPath = path.match(root);
    return !(strippedPath[0] != root || path === root);
  } catch (e) {
    console.error(e);
    return false;
  }
};

function _isWritablePath(path) {
  return (_isDescendantOfRoot(path) || path === root);
};

function _isDeletablePath (path) {
  return _isDescendantOfRoot(path);
};

function _isReadablePath(path) {
  return (_isDescendantOfRoot(path) || path === root);
}

function _isPathEqual(path1, path2) {
  var path1Stat = fs.statSync(path1);
  var path2Stat = fs.statSync(path2);

  return (path1Stat.ino === path2Stat.ino);
};

var fileSystem = {
  getChildList: function(dir){
    var path = root + (dir || '');
    if (!_isReadablePath(path)) {
      throw `Requested path is not readable: ${path}`;
    }
    return new PromiseEs6(function(resolve, reject) {
      fs.stat(path, (err, stats) => {
        if (err) return reject(err);
        if (!stats.isDirectory()) {
          return reject('Item at given path is not a directory.');
        }
        fileNames = filteredFileList(path);
        resolve(
          fileNames.map(
            fileName => {
              return decorateFile(path + fileName);
            }
          )
        );
      });
    });
  },

  sanitizedPath: _sanitizedPath,

  zip: function(dir){
    var folderPath = root + dir;
    var zipPath = tempfile('.zip');
    return new PromiseEs6(function(resolve, reject) {
      zipFolder (folderPath, zipPath, function(err) {
        if(err) {
          console.log('oh no!', err);
          reject(err);
        } else {
          var stream = fs.createReadStream(zipPath);
          stream.on('finish', function(){
            fileSystem.remove(zipPath);
          });
          resolve(stream);
          console.log(folderPath + ' has been zipped!');
        }
      });
    });
  },

  uploadFile: function(dir, newFile){
    var source = newFile.path;
    var destination = root + dir;
    if (!_isWritablePath(destination)) {
      throw `Destination not writable: ${destination}`;
    }
    fs.rename(newFile.path, destination, function(err){
      if(err) return console.log(err + '');
      console.log(newFile.path + ' will be moved to ' + root + dir);
    });
  },

  getFileBytes: function(dir){
    var path = root + dir;
    if(_isReadablePath(path)){
      return fs.readFileSync(path, 'binary');
    }
  },

  getFileSize: function(dir){
    var path = root + dir;
    if(_isReadablePath(path)){
      return fs.statSync(path).size;
    }
  },

  getFileStream: function(dir, info){
    var path = root + dir;
    info.flags = 'r';
    if(_isReadablePath(path)){
      return fs.createReadStream(path, info);
    }
  },

  rename: function(dir, newName){
    var source = root + (dir || '');
    var destination = root + newName;

    if (!_isReadablePath(source)) {
      throw `Requested path is not readable: ${source}`;
    }
    if (!_isWritablePath(destination)) {
      throw `Destination not writable: ${destination}`;
    }

    fs.rename(source, destination, function(){
    });
  },

  mkDir: function (dir) {
    var path = root + (dir || '');
    if(!_isWritablePath(path)){
      throw `Destination not writable: ${path}`;
    }
    fs.mkdirSync(path);
  },

  remove: function (dir) {
    var path = root + (dir || '');
    if(!_isDeletablePath(path)){
      throw `Requested path is not deletable: ${path}`;
    }
    fs.stat(path, (err, stats) => {
      try{
        stats = decorateFile(path);
        if (!stats.isDir) {
          fs.unlink(path, function (e){
            if (e) return console.error(e);
            return console.log('the file at ' + path + ' has been deleted');
          });
        }else if (stats.childCount < 1) {
          fs.rmdir(path, function (e){
            if (e) return console.error(e);
            return console.log('the empty folder at ' + path + ' has been deleted');
          });
        }else{
          if(decorateFile(root).ino != decorateFile(path).ino){
            rmdirRecursive(path, function (e) {
              if (e) return console.error(e);
            });
            return console.log('the folder ' + path + ' and all inner files have been deleted');

          }
        }
      }catch(err){
        console.log(err.stack);
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
