module.exports = function() {
  var builder = require('./builder');
  var babel = require('broccoli-babel-transpiler');
  var concat = require('broccoli-concat');
  var Funnel = require('broccoli-funnel');
  var Rollup = require('broccoli-rollup');
  var MergeTrees = require('broccoli-merge-trees');

  console.log('TESTS RUN BUILDER');

  // == Files for testing ==
  var testHTML = new Funnel('test', {
    files: ['index.html'],
    destDir: '/'
  });

  // Rollup testing files
  var es6tests = new Rollup('test', {
    inputFiles: ['**/*.js'],
    rollup: {
      entry: 'test.js',
      dest: 'apptests.js',
      sourceMap: 'inline'
    }
  });

  // Transpile ES6 to ES5
  var es5tests = babel(es6tests, {
    presets: ['es2015', 'stage-3'],
    browserPolyfill: true,
    sourceMap: 'inline'
  });

  // Concatenate js files
  var tests = concat(es5tests, {
    inputFiles: ['apptests.js'],
    outputFile: 'js/tests.js'
  });

  // Create tree of all outbound files
  var tree = builder();
  tree = new MergeTrees([tree, testHTML, tests]);

  return tree;
}

