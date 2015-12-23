'use strict';

function factory(Deconstructor) {

  window.spies = {};

  var record = function record(self, args, ret) {
    var use = {
      self: self,
      args: Array.prototype.slice.call(args),
      ret: ret
    };
    this._uses.push(use);
  };

  var deconstruct = function deconstruct() {
    this._deconstruct = this._deconstruct || new Deconstructor(this._fn);
    return this._deconstruct;
  };

  var functionTemplate = function () {
    var ret = __spyName__.apply(this, arguments); //jshint ignore:line
    __spyName__.calls.push({ //jshint ignore:line
      args: arguments,
      ret: ret
    });
    return ret;
  };

  var functionString = function(spyName, location) {
    return functionTemplate.toString()
      .replace(/__spyName__/g, spyName)
      .replace(/__location__/g, location);
  };

  return function Spy(fn) {
    var spy = function spy() {
      var spies = spy.deconstruct().functions();

      // setup
      spies.forEach(function(location) {
        var spyName = 'window.spies.' + location.replace(/\./g, '_');
        eval(spyName + '=' + location); //jshint ignore:line
        eval(spyName + '.calls = []'); //jshint ignore:line
        eval(location + '= ' + functionString(spyName, location)); //jshint ignore:line
      }, this);

      var ret = fn.apply(this, arguments);

      // teardown
      var calls = spies.map(function(location) {
        var spyName = 'window.spies.' + location.replace(/\./g, '_');
        var calls = eval(spyName + '.calls'); // jshint ignore:line
        eval(location + '=' + spyName); //jshint ignore:line
        return _.object([location], [calls]);
      }, this);

      console.log(_.extend.apply(null, calls));

      spy.record(this, arguments, ret);
      return ret;
    };

    spy._fn = fn;
    spy._calls = [];
    spy.record = record;
    spy.deconstruct = deconstruct;

    return spy;
  };

}

angular.module('development.Spy', [
    'development.Deconstructor'
  ])
  .factory('Spy', [
    'Deconstructor',
    factory
  ]);
