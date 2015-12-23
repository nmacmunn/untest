'use strict';

function factory(ItWriter) {

  function DescribeWriter(suite) {
    this.suite = suite;
  }

  DescribeWriter.prototype.head = function() {
    return s.sprintf('describe(\'%s\', function() {', this.suite.name);
  };

  DescribeWriter.prototype.body = function() {
    return _.map(this.suite.specs, function(spec) {
        var itWriter = new ItWriter(spec);
        return itWriter.write();
      })
      .join('\n');
  };

  DescribeWriter.prototype.foot = function() {
    return '});';
  };

  DescribeWriter.prototype.write = function() {
    return [
        this.head(),
        this.body(),
        this.foot()
      ]
      .join('\n');
  };

  return DescribeWriter;
}

angular.module('development.DescribeWriter', [
    'development.ItWriter'
  ])
  .factory('DescribeWriter', [
    'ItWriter',
    factory
  ]);
