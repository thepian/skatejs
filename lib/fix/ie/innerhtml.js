(function (global, factory) {
  if (typeof define === "function" && define.amd) {
    define(['../../native/create-event'], factory);
  } else if (typeof exports !== "undefined") {
    factory(require('../../native/create-event'));
  } else {
    var mod = {
      exports: {}
    };
    factory(global.createEvent);
    global.innerhtml = mod.exports;
  }
})(this, function (_createEvent) {
  'use strict';

  var _createEvent2 = _interopRequireDefault(_createEvent);

  function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {
      default: obj
    };
  }

  var isIeUntil10 = /MSIE/.test(navigator.userAgent);
  var isIe11 = /Trident/.test(navigator.userAgent);
  var isIe = isIeUntil10 || isIe11;
  var elementPrototype = window.HTMLElement.prototype;

  function walkTree(node, cb) {
    var childNodes = node.childNodes;

    if (!childNodes) {
      return;
    }

    var childNodesLen = childNodes.length;

    for (var a = 0; a < childNodesLen; a++) {
      var childNode = childNodes[a];
      cb(childNode, node);
      walkTree(childNode, cb);
    }
  }

  function fixInnerHTML() {
    var originalInnerHTML = Object.getOwnPropertyDescriptor(elementPrototype, 'innerHTML');

    var get = function get() {
      return originalInnerHTML.get.call(this);
    };

    get._hasBeenEnhanced = true;
    Object.defineProperty(elementPrototype, 'innerHTML', {
      get: get,
      set: function set(html) {
        walkTree(this, function (node, parentNode) {
          var mutationEvent = (0, _createEvent2.default)('MutationEvent');
          mutationEvent.initMutationEvent('DOMNodeRemoved', true, false, parentNode, null, null, null, null);
          node.dispatchEvent(mutationEvent);
        });
        originalInnerHTML.set.call(this, html);
      }
    });
  }

  if (isIe) {
    var propertyDescriptor = Object.getOwnPropertyDescriptor(elementPrototype, 'innerHTML');
    var hasBeenEnhanced = !!propertyDescriptor && propertyDescriptor.get._hasBeenEnhanced;

    if (!hasBeenEnhanced) {
      if (isIe11) {
        window.MutationObserver = window.JsMutationObserver || window.MutationObserver;
      }

      fixInnerHTML();
    }
  }
});