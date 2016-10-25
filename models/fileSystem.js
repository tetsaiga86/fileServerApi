const fs = require('fs');
const root = 'C:/Users/Kyle/Music/'
var Promise = require('es6-promise').Promise;


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
  },

  remove: function (dir) {
    fs.stat(root+dir, (err, stats) => {
      try{
        stats = decorateFile(root+dir);
        //console.log(stats);
        if (!stats.isDirectory) {
          fs.unlink(root+dir, function (e){
            if (e) return console.error(e);
             return console.log('the file at ' + root + dir +' has been deleted');
          })
        }else if (stats.childCount < 1) {
          fs.rmdir(root+dir, function (e){
            if (e) return console.error(e);
             return console.log('the empty folder at '+root + dir +' has been deleted');
          })
        }else{
          rmdirAsync(root+dir, function (e) {
            if (e) return console.error(e);
          })
          return console.log('the folder '+root+dir+' and all inner files have been deleted');
        }
      }catch(err){
      console.log(err+'');
      }
    })
  }
}

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

function rmdirAsync(path, callback) {
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
		path = path.replace(/\/+$/,"");
		files.forEach(function(file) {
			var curPath = path + "/" + file;
			fs.lstat(curPath, function(err, stats) {
				if( err ) {
					callback(err, []);
					return;
				}
				if( stats.isDirectory() ) {
					rmdirAsync(curPath, folderDone);
				} else {
					fs.unlink(curPath, folderDone);
				}
			});
		});
	});
};

module.exports = fileSystem;
