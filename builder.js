module.exports = function () {
  // This is the core of Brocfile. It sets up all the assets from the input JS/CSS/images
  // and so on and converts them to static assets in the output directory or
  // preview server.
  var helper = require('./helpers/broccoli');
  var babel = require('broccoli-babel-transpiler');
  var concat = require('broccoli-concat');
  var compileSass = require('broccoli-sass-source-maps');
  var BroccoliSource = require('broccoli-source');
  var WatchedDir = BroccoliSource.WatchedDir;
  var Funnel = require('broccoli-funnel');
  var Handlebars = require('broccoli-handlebars-precompiler');
  var MergeTrees = require('broccoli-merge-trees');
  var Uglify = require('broccoli-uglify-sourcemap');
  var Rollup = require('broccoli-rollup');
  var BROC_ENV = process.env['BROCCOLI_ENV'] || 'development';
  var APP_ENV = process.env['APP_ENV'];
  var appRoot = 'app';

  console.log('APP_ENV = ' + APP_ENV);
  console.log('Broccoli env = '  + BROC_ENV);

  // == Load External Libraries ==
  // Order is important. Scripts will be concatenated in this order, and
  // styles will be concatenated in this order (into separate JS and CSS files
  // obviously).
  // Assets will be funnelled into a single tree with the same name
  // as the source asset directory. (e.g. 'img' directory will create 'img'
  // directory in output.)
  helper.loadLibrary('node_modules/jquery/dist', {
    scripts: ['jquery.js'],
    styles: [],
    assets: []
  });

  helper.loadLibrary('node_modules/bootstrap/dist', {
    scripts: ['js/bootstrap.js'],
    styles: ['css/bootstrap.css'],
    assets: ['']
  });

  helper.loadLibrary('node_modules/babel-polyfill/dist', {
    scripts: ['polyfill.js'],
    styles: [],
    assets: []
  });

  helper.loadLibrary('node_modules/underscore', {
    scripts: ['underscore.js'],
    styles: [],
    assets: []
  });

  helper.loadLibrary('node_modules/backbone', {
    scripts: ['backbone.js'],
    styles: [],
    assets: []
  });

  helper.loadLibrary('node_modules/backbone.radio/build', {
    scripts: ['backbone.radio.js'],
    styles: [],
    assets: []
  });

  helper.loadLibrary('node_modules/backbone.marionette/lib', {
    scripts: ['backbone.marionette.js'],
    styles: [],
    assets: []
  });

  helper.loadLibrary('node_modules/handlebars/dist', {
    scripts: ['handlebars.js'],
    styles: [],
    assets: []
  });

  helper.loadLibrary('vendor', {
    scripts: [],
    styles: [],
    assets: ['images']
  });


  // == Build Templates ==
  // Combines Handlebars templates into a single file. MUST be loaded after the
  // Handlebars library.
  var templatesDir = appRoot + '/templates';
  var templates = new WatchedDir(templatesDir);
  templates = new Handlebars(templates, {
    namespace: 'APP.Templates',
    srcDir: '.'
  });
  templates = concat(templates, {
    outputFile: 'js/templs.js'
  });


  // == Concatenate app scripts  ==
  // Rollup app js dependencies
  var es6 = new Rollup(appRoot, {
    inputFiles: ['**/*.js'],
    rollup: {
      entry: 'app.js',
      dest: 'application.js',
      sourceMap: 'inline'
    }
  });

  // Transpile ES6 to ES5
  var es5 = babel(es6, {
    presets: ['es2015', 'stage-3'],
    browserPolyfill: true,
    sourceMap: 'inline'
  });

  // Concatenate js files
  var jsApp = concat(es5, {
    inputFiles: ['application.js'],
    outputFile: 'js/app.js'
  });

  // == Concatenate all vednor libs ==
  var jsLibraries = helper.getScriptsTree();
  jsLibraries = concat(jsLibraries, {
    inputFiles: ['libraries.js'],
    outputFile: 'js/libs.js',
    header: ''
  });
  if (APP_ENV === 'production'  || BROC_ENV === 'production') {
    jsLibraries = new Uglify(jsLibraries);
  }

  // == Concatenate style trees ==
  // Compile app sass styles
  var appCss = compileSass(
    [appRoot],
    'styles/app.scss',
    'application.css',
    {
      sourceMap: true,
      sourceMapEmbed: true,
      sourceMapContents: true,
    }
  );

  // Merge app and vendor styles
  helper.loadLibrary(appCss, {
    scripts: [],
    styles: ['application.css'],
    assets: []
  });

  // Concatenate all (vendor + app)styles
  var css = helper.getStylesTree();
  var allStyles = concat(css, {
    inputFiles: ['libraries.css'],
    outputFile: 'css/app.css',
    header: '',
    sourceMapConfig: {
      enabled: false,
      extensions: ['css'],
      mapCommentType: 'block'
    }
  });

  // Get bootstrap css map
  var boostrapCssMap = new Funnel('node_modules/bootstrap/dist/css', {
    files: ['bootstrap.min.css.map', 'bootstrap.css.map'],
    destDir: '/css'
  });

  // == Create tree of all outbound files ==
  var tree = new MergeTrees([jsLibraries, jsApp, allStyles, templates, 
    boostrapCssMap]);

  return tree;
}
