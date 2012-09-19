/// Knockout Merge plugin v2.3.0
/// (c) 2012 meno abels  
/// License: MIT (http://www.opensource.org/licenses/mit-license.php)
/// Currently depends on jquery but this is easy to remove

// If Jquery is missing BEGIN
if (typeof($) == "undefined") {
  var class2type = {}
  var types = "Boolean Number String Function Array Date RegExp Object".split(" ");
  for (var idx in types) {
    name = types[idx]
    class2type[ "[object " + name + "]" ] = name.toLowerCase();
  }
  var hasOwn = Object.prototype.hasOwnProperty

  var jQuery = {
    type: function( obj ) {
      return obj == null ?
        String( obj ) :
        class2type[ toString.call(obj) ] || "object";
    },
    isPlainObject: function( obj ) {
      if (obj == null) {
        return false
      }

      // Not own constructor property must be Object
      if ( obj.constructor &&
        !hasOwn.call(obj, "constructor") &&
        !hasOwn.call(obj.constructor.prototype, "isPrototypeOf") ) {
        return false;
      }

      // Own properties are enumerated firstly, so to speed up,
      // if last one is own, then all properties are own.

      var key;
      for ( key in obj ) {}

      return key === undefined || hasOwn.call( obj, key );
    },
    isArray: Array.isArray || function( obj ) {
      return jQuery.type(obj) === "array";
    }
  }
  var $ = jQuery
}
// If Jquery is missing END

(function (factory) {
  // Module systems magic dance.

  if (typeof require === "function" && typeof exports === "object" && typeof module === "object") {
    // CommonJS or Node: hard-coded dependency on "knockout"
    factory(require("knockout"), exports);
  } else if (typeof define === "function" && define["amd"]) {
    // AMD anonymous module with hard-coded dependency on "knockout"
    define(["knockout", "exports"], factory);
  } else {
    // <script> tag: use the global `ko` object, attaching a `mapping` property
    factory(ko, ko.merger = {});
  }
}(function (ko, exports) {

  exports.toObject = function(obj) {
    return exports.merge({
      "*": function(dest, src, recurse, ret) {
          if (typeof src == "function") {
            if ($.type(src()) == "array") {
              dest = []
              for(var i = 0; i < src().length; ++i) {
                dest.push(recurse(null, src()[i]));
              }
            } else {
              dest = src();
            }
          } else {
            if (!dest) {
              dest = {}
            }
            for (var i in src) {
              dest[i] = recurse(dest[i], src[i]);
            }
          }
          return dest;
        }
    }, {}, obj)
  }
    exports.defaultMapper = {
      "*": function(dest, src, recurse) {
        var type = $.type(src)
        if (({"number":true,
              "string":true,
              "boolean":true,
              "null":true})[type]) {
          if (!dest) {
            dest = ko.observable(src)
          } else {
            dest(src)
          }
          return dest;
        } else if (type == "array") {
           if (!dest) { 
             dest = ko.observableArray();
           }
           for(var i = 0; i < src.length; ++i) {
             dest.push(recurse(null, src[i]));
           }
           return dest;
        }
        return recurse(dest, src);
      }
    } 
    exports.merge = function(converter, dest, src, path /*INTERN->*/, recurse, ret, i, key) { 
      recurse = exports.merge
      converter = converter || exports.defaultMapper
      var defaultAction = converter['*'] || exports.defaultMapper['*']
      path = path || ""
      if ($.isArray(src)) {
        ret = []
        for(i = 0; i < src.length; ++i) {
          ret[i] = (converter[path+'.*'] || defaultAction)(ret[i], src[i], function(dest, src) { 
            return recurse(converter, dest, src, path) 
          })
        }
        return ret
      } else if ($.isPlainObject(src)) {
        if (dest === null || typeof(dest) == "undefined") {
          dest = {} 
        }
        for(key in src) {
          var tmp = (path.length ? [path, key] : [key]).join('.')
          dest[key] = (converter[tmp] || defaultAction)(dest[key], src[key], function(dest, src) { 
            return recurse(converter, dest, src, tmp) 
          })
        }
        return dest;
      } else {
        return src;
      }
    }
}))
