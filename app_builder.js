module.exports = function() {
  var builder = require('./builder');
  var Pug = require('broccoli-pug');
  var BroccoliSource = require('broccoli-source');
  var Funnel = require('broccoli-funnel');
  var WatchedDir = BroccoliSource.WatchedDir;
  var MergeTrees = require('broccoli-merge-trees');
  var Gzip = require('broccoli-gzip');
  var LiveReload = require('broccoli-livereload');
  var BROC_ENV = process.env['BROCCOLI_ENV'] || 'development';
  var APP_ENV  = process.env['APP_ENV'];

  // == Compile app view files ==
  var htmlDir = 'app/html'; // setting
  var htmlFiles = new WatchedDir(htmlDir);
  var appHTML = new Funnel(htmlFiles, {
    files: ['index.html'],
    destDir: '/'
  });

  // == Create tree of all outbound files ==
  var tree = builder();
  tree = new MergeTrees([tree, appHTML]);

  // == Build gzipped versions of the files, but only in production. ==
  if (APP_ENV === 'production' || BROC_ENV === 'production') {
    treeGZIP = new Gzip(tree, { extensions: ['html', 'css', 'js', 'map'] });
    tree = new MergeTrees([tree, treeGZIP]);
  } else {
    // Include live reaload server
    if (BROC_ENV === 'development') {
      tree = new LiveReload(tree, {
        target: 'index.html',
      });
    }
  }

  return tree;
}
