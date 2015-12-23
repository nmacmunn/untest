'use strict';

function factory(Spec, Spy) {

  function Suite(fn, name) {
    this.fn = fn;
    this.name = name;
    window.suites[name] = this;
  }

  Suite.prototype.specs = function() {
    // this._specs = this._specs ||
  };

  Suite.prototype.spy = function() {
    this._spy = this._spy || new Spy(this.fn);
    return this._spy;
  };

  return Suite;
}

angular.module('development.Suite', [
    'development.Spec',
    'development.Spy'
  ])
  .factory('Suite', [
    'Spec',
    'Spy',
    factory
  ]);
