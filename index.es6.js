
var fs = require('fs');
var path = require('path');
var suspend = require('suspend');
var resume = suspend.resume;

var addComponentSymlinks = suspend.async(function* (dirname) {
  console.error('addComponentSymlinks: %j', dirname);

  var stat = yield fs.lstat(dirname, resume());

  // we only care about directories here
  if (!stat) return;
  if (stat.isSymbolicLink()) return;
  if (!stat.isDirectory()) return;

  var dirs;
  var nodeModulesDir = path.resolve(dirname, 'node_modules');
  try {
    dirs = yield fs.readdir(nodeModulesDir, resume());
  } catch (e) {
    // return on ENOENT, everything can be re-thrown
    if ('ENOENT' == e.code) {
      return;
    } else {
      throw e;
    }
  }

  // iterate through the dirs, currently doing all processing in parallel
  for (var i = 0; i < dirs.length; i++) {
    var dir = path.resolve(nodeModulesDir, dirs[i]);
    processDir(dir, suspend.fork());
    addComponentSymlinks(dir, suspend.fork());
  }

  return yield suspend.join();
});

var processDir = suspend.async(function* (dirname) {
  console.error('processDir: %j', dirname);

  // checks the `component.json` in the specified dir
  var stat = yield fs.lstat(dirname, resume());

  // we only care about directories here
  if (!stat) return;
  if (stat.isSymbolicLink()) return;
  if (!stat.isDirectory()) return;

  var componentPath = path.resolve(dirname, 'component.json');
  var component;
  try {
    var data = yield fs.readFile(componentPath, 'utf8', resume());
    component = JSON.parse(data);
  } catch (e) {
    // ignore ENOENT, everything can be re-thrown
    if ('ENOENT' != e.code) throw e;
  }

  if (!component || !component.name) {
    return;
  }
  console.error('read "component.json" file with "name": %j', component.name);

  var nodeModulesDir = path.dirname(dirname);
  var src = path.basename(dirname);
  if (src == component.name) {
    console.error('ignoring matching package and component name: %j', src);
    return;
  }
  var dst = path.resolve(nodeModulesDir, component.name);

  try {
    yield fs.unlink(dst, resume());
  } catch (e) {
    // ignore ENOENT, everything can be re-thrown
    if ('ENOENT' != e.code) throw e;
  }

  // finally, we can add a symlink for this component
  console.log('adding symlink %j -> %j', src, component.name);
  yield fs.symlink(src, dst, resume());

});


module.exports = addComponentSymlinks;
