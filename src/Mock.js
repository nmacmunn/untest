'use strict';

function factory(Spy) {


  function mockArray(arr) {
    return Array.prototype.slice.call(arr);
  }

  function mockFunction(fn) {
    return new Spy(fn);
  }

  function Mock(val, mask) {

    if (!mask) {
      return;
    }

    var mock = this;

    if (_.isFunction(val)) {
      mock = mockFunction(val);
    }

    if (_.isArray(val)) {
      mock = mockArray(val);
    }

    if (_.isObject(val)) {
      _.each(mask, function(subMask, key) {
        mock[key] = new Mock(val[key], subMask);
      });
    } else {
      mock = val;
    }

    return mock;
  }

  /**
   * Convert undefined to a string before stringifying.
   *
   * @param  {string} k Attribute key
   * @param  {String} v Attribute value
   * @return {String}
   */
  function replacer(k, v) {
    if (v === undefined) {
      v = 'undefined';
    } else if (_.isFunction(v)) {
      v = v.toString()
        .replace(/\n/g, '')
        .replace(/ +/g, ' ');
    }
    return v;
  }

  /**
   * Convert to JSON, and then do additional modification to the output.
   *
   * @param  {Object} obj Object to represent as a string.
   * @return {String}
   */
  Mock.prototype._stringify = function() {
    return JSON.stringify(this, replacer)
      .replace(/"undefined"/g, 'undefined')
      .replace(/"(\w+)":/g, '$1:')
      .replace(/"/g, '\'');
  };

  return Mock;
}

angular.module('development.Mock', [
    'development.Spy'
  ])
  .factory('Mock', [
    'Spy',
    factory
  ]);
