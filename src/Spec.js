'use strict';

function factory(Mock) {

  function Spec(self, args, ret, suite) {
    this.suite = suite;
    if (this.test(self, args, ret)) {
      console.log(this);
    } else {
      console.error('giving up on', this);
    }
  }

  Spec.prototype.test = function(self, args, ret) {
    var pass = false;
    try {
      var mockSelf = new Mock(self, this.suite.selfMask());
      var mockArgs = new Mock(args, {});
      this.run(mockSelf, mockArgs);
      pass = true;
    } catch(e) {
      console.error(e);
    }
    return pass;
  };

  Spec.prototype.run = function(self, args) {
    this.preSelf = self.stringify();
    this.preArgs = args.stringify();

    this.ret = this.suite.fn.apply(self, args);

    this.postSelf = self.stringify();
    this.postArgs = args.stringify();
  };

  Spec.prototype.toJSON = function() {
    return [
      this.preSelf, this.preArgs, this.postSelf, this.postArgs, this.ret
    ];
  };

  return Spec;
}

angular.module('development.Spec', [
    'development.Mock'
  ])
  .factory('Spec', [
    'Mock',
    factory
  ]);
