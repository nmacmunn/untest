'use strict';

function factory() {

  var esprima = window.esprima;

  function Deconstructor(fn) {
    this.fn = fn;
  }

  /**
   * Parse the function being spied on use esprima and return the first element
   * of the node body.
   *
   * @method parseFn
   * @return {Object} BlockStatement node.
   */
  Deconstructor.prototype.parsed = function() {
    this._parsed = this._parsed || esprima.parse(this.fn);
    return this._parsed;
  };

  /**
   * Get the names of the arguments specified in this function signature.
   *
   * @method args
   * @return {Array}
   */
  Deconstructor.prototype.args = function() {
    this._args = this._args || _.pluck(this.parsed().params, 'name');
    return this._args;
  };

  /**
   * Get the BlockStatement node from the parsed function.
   *
   * @method body
   * @return {Object}
   */
  Deconstructor.prototype.body = function() {
    this._body = this._body || this.search(this.parsed(), 'BlockStatement');
    return this._body;
  };

  Deconstructor.prototype.callExpressions = function() {
    this._callExpressions = this._callExpressions || this.search(this.body(), 'CallExpression');
    return this._callExpressions;
  };

  function chainLocation(node, location) {

    if (node.object) {
      chainLocation(node.object, location);
    }

    if (node.type === 'Identifier') {
      location.push(node.name);
    } else if (node.type === 'ThisExpression') {
      location.push('this');
    } else {
      location.push(node.property.name);
    }

    return location.join('.');
  }

  Deconstructor.prototype.functions = function() {
    return _.map(this.callExpressions(), function(node) {
      return chainLocation(node.callee, []);
    });
  };

  /**
   * Search the function body for nodes of the type MemberExpression.
   *
   * @method memberExpressions
   * @return {Array}
   */
  Deconstructor.prototype.memberExpressions = function memberExpressions() {
    this._memberExpressions = this._memberExpressions || this.search(this.body(), 'MemberExpression');
    return this._memberExpressions;
  };

  /**
   * Search all branches of the syntax tree starting with node and return the
   * first occurances of nodes of the specified type. Meant to be called
   * recursively.
   *
   * @param  {Object} node    The top level node
   * @param  {String} type    The type of node to search for
   * @param  {Array}  results Array to store discovered nodes in
   * @return {Array}
   */
  Deconstructor.prototype.search = function(node, type, results) {
    results = results || [];
    if (node && node.type === type) {
      results.push(node);
    } else if (_.isObject(node)) {
      _.each(node, function(subnode) {
        this.search(subnode, type, results);
      }, this);
    }
    return results;
  };

  /**
   * Traverse to the bottom of a series of nodes, and then add properties to
   * context, nesting them while traversing up. Meant to be called recursively.
   *
   * @param  {Object} node    The current node
   * @param  {Object} context The object to populate with properties
   * @return {Object}         Context, or the newly created property
   */
  function chain(node, context) {
    if (node.object) {
      context = chain(node.object, context);
    }
    if (node.property && !node.computed) {
      context[node.property.name] = context[node.property.name] || {};
      context = context[node.property.name];
    }
    return context;
  }

  /**
   * Iterate over MemberExpression nodes looking for those that terminate with
   * a ThisExpression node and then construct an object representing all of the
   * nested context properties that are accessed by the function under test.
   *
   * @method selfMask
   * @return {Object} An object that can be used to mask the context of a
   *                  function to produce the minimum viable mock.
   */
  Deconstructor.prototype.selfMask = function selfMask() {
    var context = {};
    var self = this;

    _.chain(self.memberExpressions())
      .filter(function(node) {
        return self.search(node, 'ThisExpression').length;
      })
      .each(function(node) {
        chain(node, context);
      });

    return context;
  };



  return Deconstructor;
}

angular.module('development.Deconstructor', [])
  .factory('Deconstructor', [
    factory
  ]);
