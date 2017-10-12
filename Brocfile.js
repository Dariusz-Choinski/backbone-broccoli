var AppBuilder = require('./app_builder');
var TestBuilder = require('./test_builder');

var BROC_ENV = process.env['BROCCOLI_ENV'];

if (BROC_ENV === 'test') {
  return module.exports = TestBuilder();
} else {
  return module.exports = AppBuilder();
}

