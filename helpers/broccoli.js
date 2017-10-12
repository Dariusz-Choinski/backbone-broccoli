"use strict";
var concat     = require('broccoli-concat');
var Funnel     = require('broccoli-funnel');
var MergeTrees = require('broccoli-merge-trees');

var assets      = [];
var libraryTree = MergeTrees([]);
var scripts     = [];
var styles      = [];

var BroccoliHelper = {
  // Merge all the asset trees in the same order they were loaded.
  getAssetsTree() {
    return new MergeTrees(assets);
  },

  // Merge all the library trees, and concatenate the script assets in the same
  // order they were loaded.
  // Returns a tree with a single file, `libraries.js`
  getScriptsTree() {
    return concat(libraryTree, {
      headerFiles: scripts,
      outputFile: 'libraries.js'
    });
  },

  // Merge all the library trees, and concatenate the style assets in the same
  // order they were loaded.
  // Returns a tree with a single file, `libraries.css`
  getStylesTree() {
    return concat(libraryTree, {
      headerFiles: styles,
      outputFile: 'libraries.css'
    });
  },

  // Import a library into the build.
  // `path` should correspond to the local path to the directory of files you
  // want to import.
  // `scripts` is a list of JS files inside `path` you want to import, in order.
  // `styles` is a list of CSS files inside `path` you want to import, in order.
  // `assets` is a list of directories inside `path` that you want to have
  // copied into the output directory.
  // `exclude` is a list of files to specifically exclude. Useful for when two
  // libraries include the same-named files.
  loadLibrary(path, options) {
    var lib = new Funnel(path, {
      include: [
        "**/*.css",
        "**/*.js",
        "**/*.map"
      ],
      exclude: options.exclude || []
    });
    libraryTree = new MergeTrees([libraryTree, lib]);
    scripts     = scripts.concat(options.scripts);
    styles      = styles.concat(options.styles);

    var assetTrees = options.assets.map(function(asset) {
      return new Funnel(path + '/' + asset, {
        destDir: asset
      });
    });

    assets = assets.concat(assetTrees);
  }
};

module.exports = BroccoliHelper;
 
