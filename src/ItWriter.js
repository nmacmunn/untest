'use strict';

function factory() {

  function ItWriter(spec) {
    this.spec = spec;
  }

  ItWriter.prototype.head = function() {
    var ret = this.spec.ret.replace(/'/g, '\\\'');
    var preArgs = this.spec.preArgs.replace(/'/g, '\\\'');

    return s.sprintf('  it(\'should return %s given %s\', function() {', ret, preArgs);
  };

  ItWriter.prototype.body = function() {
    var name = this.spec.suite.name;
    var preSelf = this.spec.preSelf;
    var preArgs = this.spec.preArgs;
    var ret = this.spec.ret;

    return s.sprintf('    expect(%s.apply(%s, %s)).toEqual(%s);', name, preSelf, preArgs, ret);
  };

  ItWriter.prototype.foot = function() {
    return '  });';
  };

  ItWriter.prototype.write = function() {
    return [
        this.head(),
        this.body(),
        this.foot()
      ]
      .join('\n');
  };

  return ItWriter;
}

angular.module('development.ItWriter', [])
  .factory('ItWriter', [
    factory
  ]);
