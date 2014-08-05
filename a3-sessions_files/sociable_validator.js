(function () {
/**
 * almond 0.2.5 Copyright (c) 2011-2012, The Dojo Foundation All Rights Reserved.
 * Available via the MIT or new BSD license.
 * see: http://github.com/jrburke/almond for details
 */
//Going sloppy to avoid 'use strict' string cost, but strict practices should
//be followed.
/*jslint sloppy: true */
/*global setTimeout: false */

var requirejs, require, define;
(function (undef) {
    var main, req, makeMap, handlers,
        defined = {},
        waiting = {},
        config = {},
        defining = {},
        hasOwn = Object.prototype.hasOwnProperty,
        aps = [].slice;

    function hasProp(obj, prop) {
        return hasOwn.call(obj, prop);
    }

    /**
     * Given a relative module name, like ./something, normalize it to
     * a real name that can be mapped to a path.
     * @param {String} name the relative name
     * @param {String} baseName a real name that the name arg is relative
     * to.
     * @returns {String} normalized name
     */
    function normalize(name, baseName) {
        var nameParts, nameSegment, mapValue, foundMap,
            foundI, foundStarMap, starI, i, j, part,
            baseParts = baseName && baseName.split("/"),
            map = config.map,
            starMap = (map && map['*']) || {};

        //Adjust any relative paths.
        if (name && name.charAt(0) === ".") {
            //If have a base name, try to normalize against it,
            //otherwise, assume it is a top-level require that will
            //be relative to baseUrl in the end.
            if (baseName) {
                //Convert baseName to array, and lop off the last part,
                //so that . matches that "directory" and not name of the baseName's
                //module. For instance, baseName of "one/two/three", maps to
                //"one/two/three.js", but we want the directory, "one/two" for
                //this normalization.
                baseParts = baseParts.slice(0, baseParts.length - 1);

                name = baseParts.concat(name.split("/"));

                //start trimDots
                for (i = 0; i < name.length; i += 1) {
                    part = name[i];
                    if (part === ".") {
                        name.splice(i, 1);
                        i -= 1;
                    } else if (part === "..") {
                        if (i === 1 && (name[2] === '..' || name[0] === '..')) {
                            //End of the line. Keep at least one non-dot
                            //path segment at the front so it can be mapped
                            //correctly to disk. Otherwise, there is likely
                            //no path mapping for a path starting with '..'.
                            //This can still fail, but catches the most reasonable
                            //uses of ..
                            break;
                        } else if (i > 0) {
                            name.splice(i - 1, 2);
                            i -= 2;
                        }
                    }
                }
                //end trimDots

                name = name.join("/");
            } else if (name.indexOf('./') === 0) {
                // No baseName, so this is ID is resolved relative
                // to baseUrl, pull off the leading dot.
                name = name.substring(2);
            }
        }

        //Apply map config if available.
        if ((baseParts || starMap) && map) {
            nameParts = name.split('/');

            for (i = nameParts.length; i > 0; i -= 1) {
                nameSegment = nameParts.slice(0, i).join("/");

                if (baseParts) {
                    //Find the longest baseName segment match in the config.
                    //So, do joins on the biggest to smallest lengths of baseParts.
                    for (j = baseParts.length; j > 0; j -= 1) {
                        mapValue = map[baseParts.slice(0, j).join('/')];

                        //baseName segment has  config, find if it has one for
                        //this name.
                        if (mapValue) {
                            mapValue = mapValue[nameSegment];
                            if (mapValue) {
                                //Match, update name to the new value.
                                foundMap = mapValue;
                                foundI = i;
                                break;
                            }
                        }
                    }
                }

                if (foundMap) {
                    break;
                }

                //Check for a star map match, but just hold on to it,
                //if there is a shorter segment match later in a matching
                //config, then favor over this star map.
                if (!foundStarMap && starMap && starMap[nameSegment]) {
                    foundStarMap = starMap[nameSegment];
                    starI = i;
                }
            }

            if (!foundMap && foundStarMap) {
                foundMap = foundStarMap;
                foundI = starI;
            }

            if (foundMap) {
                nameParts.splice(0, foundI, foundMap);
                name = nameParts.join('/');
            }
        }

        return name;
    }

    function makeRequire(relName, forceSync) {
        return function () {
            //A version of a require function that passes a moduleName
            //value for items that may need to
            //look up paths relative to the moduleName
            return req.apply(undef, aps.call(arguments, 0).concat([relName, forceSync]));
        };
    }

    function makeNormalize(relName) {
        return function (name) {
            return normalize(name, relName);
        };
    }

    function makeLoad(depName) {
        return function (value) {
            defined[depName] = value;
        };
    }

    function callDep(name) {
        if (hasProp(waiting, name)) {
            var args = waiting[name];
            delete waiting[name];
            defining[name] = true;
            main.apply(undef, args);
        }

        if (!hasProp(defined, name) && !hasProp(defining, name)) {
            throw new Error('No ' + name);
        }
        return defined[name];
    }

    //Turns a plugin!resource to [plugin, resource]
    //with the plugin being undefined if the name
    //did not have a plugin prefix.
    function splitPrefix(name) {
        var prefix,
            index = name ? name.indexOf('!') : -1;
        if (index > -1) {
            prefix = name.substring(0, index);
            name = name.substring(index + 1, name.length);
        }
        return [prefix, name];
    }

    /**
     * Makes a name map, normalizing the name, and using a plugin
     * for normalization if necessary. Grabs a ref to plugin
     * too, as an optimization.
     */
    makeMap = function (name, relName) {
        var plugin,
            parts = splitPrefix(name),
            prefix = parts[0];

        name = parts[1];

        if (prefix) {
            prefix = normalize(prefix, relName);
            plugin = callDep(prefix);
        }

        //Normalize according
        if (prefix) {
            if (plugin && plugin.normalize) {
                name = plugin.normalize(name, makeNormalize(relName));
            } else {
                name = normalize(name, relName);
            }
        } else {
            name = normalize(name, relName);
            parts = splitPrefix(name);
            prefix = parts[0];
            name = parts[1];
            if (prefix) {
                plugin = callDep(prefix);
            }
        }

        //Using ridiculous property names for space reasons
        return {
            f: prefix ? prefix + '!' + name : name, //fullName
            n: name,
            pr: prefix,
            p: plugin
        };
    };

    function makeConfig(name) {
        return function () {
            return (config && config.config && config.config[name]) || {};
        };
    }

    handlers = {
        require: function (name) {
            return makeRequire(name);
        },
        exports: function (name) {
            var e = defined[name];
            if (typeof e !== 'undefined') {
                return e;
            } else {
                return (defined[name] = {});
            }
        },
        module: function (name) {
            return {
                id: name,
                uri: '',
                exports: defined[name],
                config: makeConfig(name)
            };
        }
    };

    main = function (name, deps, callback, relName) {
        var cjsModule, depName, ret, map, i,
            args = [],
            usingExports;

        //Use name if no relName
        relName = relName || name;

        //Call the callback to define the module, if necessary.
        if (typeof callback === 'function') {

            //Pull out the defined dependencies and pass the ordered
            //values to the callback.
            //Default to [require, exports, module] if no deps
            deps = !deps.length && callback.length ? ['require', 'exports', 'module'] : deps;
            for (i = 0; i < deps.length; i += 1) {
                map = makeMap(deps[i], relName);
                depName = map.f;

                //Fast path CommonJS standard dependencies.
                if (depName === "require") {
                    args[i] = handlers.require(name);
                } else if (depName === "exports") {
                    //CommonJS module spec 1.1
                    args[i] = handlers.exports(name);
                    usingExports = true;
                } else if (depName === "module") {
                    //CommonJS module spec 1.1
                    cjsModule = args[i] = handlers.module(name);
                } else if (hasProp(defined, depName) ||
                           hasProp(waiting, depName) ||
                           hasProp(defining, depName)) {
                    args[i] = callDep(depName);
                } else if (map.p) {
                    map.p.load(map.n, makeRequire(relName, true), makeLoad(depName), {});
                    args[i] = defined[depName];
                } else {
                    throw new Error(name + ' missing ' + depName);
                }
            }

            ret = callback.apply(defined[name], args);

            if (name) {
                //If setting exports via "module" is in play,
                //favor that over return value and exports. After that,
                //favor a non-undefined return value over exports use.
                if (cjsModule && cjsModule.exports !== undef &&
                        cjsModule.exports !== defined[name]) {
                    defined[name] = cjsModule.exports;
                } else if (ret !== undef || !usingExports) {
                    //Use the return value from the function.
                    defined[name] = ret;
                }
            }
        } else if (name) {
            //May just be an object definition for the module. Only
            //worry about defining if have a module name.
            defined[name] = callback;
        }
    };

    requirejs = require = req = function (deps, callback, relName, forceSync, alt) {
        if (typeof deps === "string") {
            if (handlers[deps]) {
                //callback in this case is really relName
                return handlers[deps](callback);
            }
            //Just return the module wanted. In this scenario, the
            //deps arg is the module name, and second arg (if passed)
            //is just the relName.
            //Normalize module name, if it contains . or ..
            return callDep(makeMap(deps, callback).f);
        } else if (!deps.splice) {
            //deps is a config object, not an array.
            config = deps;
            if (callback.splice) {
                //callback is an array, which means it is a dependency list.
                //Adjust args if there are dependencies
                deps = callback;
                callback = relName;
                relName = null;
            } else {
                deps = undef;
            }
        }

        //Support require(['a'])
        callback = callback || function () {};

        //If relName is a function, it is an errback handler,
        //so remove it.
        if (typeof relName === 'function') {
            relName = forceSync;
            forceSync = alt;
        }

        //Simulate async callback;
        if (forceSync) {
            main(undef, deps, callback, relName);
        } else {
            //Using a non-zero value because of concern for what old browsers
            //do, and latest browsers "upgrade" to 4 if lower value is used:
            //http://www.whatwg.org/specs/web-apps/current-work/multipage/timers.html#dom-windowtimers-settimeout:
            //If want a value immediately, use require('id') instead -- something
            //that works in almond on the global level, but not guaranteed and
            //unlikely to work in other AMD implementations.
            setTimeout(function () {
                main(undef, deps, callback, relName);
            }, 4);
        }

        return req;
    };

    /**
     * Just drops the config on the floor, but returns req in case
     * the config return value is used.
     */
    req.config = function (cfg) {
        config = cfg;
        if (config.deps) {
            req(config.deps, config.callback);
        }
        return req;
    };

    define = function (name, deps, callback) {

        //This module may not have dependencies
        if (!deps.splice) {
            //deps is not an array, so probably means
            //an object literal or factory function for
            //the value. Adjust args.
            callback = deps;
            deps = [];
        }

        if (!hasProp(defined, name) && !hasProp(waiting, name)) {
            waiting[name] = [name, deps, callback];
        }
    };

    define.amd = {
        jQuery: true
    };
}());

define("requireLib", function(){});

//     Underscore.js 1.4.3
//     http://underscorejs.org
//     (c) 2009-2012 Jeremy Ashkenas, DocumentCloud Inc.
//     Underscore may be freely distributed under the MIT license.

(function() {

  // Baseline setup
  // --------------

  // Establish the root object, `window` in the browser, or `global` on the server.
  var root = this;

  // Save the previous value of the `_` variable.
  var previousUnderscore = root._;

  // Establish the object that gets returned to break out of a loop iteration.
  var breaker = {};

  // Save bytes in the minified (but not gzipped) version:
  var ArrayProto = Array.prototype, ObjProto = Object.prototype, FuncProto = Function.prototype;

  // Create quick reference variables for speed access to core prototypes.
  var push             = ArrayProto.push,
      slice            = ArrayProto.slice,
      concat           = ArrayProto.concat,
      toString         = ObjProto.toString,
      hasOwnProperty   = ObjProto.hasOwnProperty;

  // All **ECMAScript 5** native function implementations that we hope to use
  // are declared here.
  var
    nativeForEach      = ArrayProto.forEach,
    nativeMap          = ArrayProto.map,
    nativeReduce       = ArrayProto.reduce,
    nativeReduceRight  = ArrayProto.reduceRight,
    nativeFilter       = ArrayProto.filter,
    nativeEvery        = ArrayProto.every,
    nativeSome         = ArrayProto.some,
    nativeIndexOf      = ArrayProto.indexOf,
    nativeLastIndexOf  = ArrayProto.lastIndexOf,
    nativeIsArray      = Array.isArray,
    nativeKeys         = Object.keys,
    nativeBind         = FuncProto.bind;

  // Create a safe reference to the Underscore object for use below.
  var _ = function(obj) {
    if (obj instanceof _) return obj;
    if (!(this instanceof _)) return new _(obj);
    this._wrapped = obj;
  };

  // Export the Underscore object for **Node.js**, with
  // backwards-compatibility for the old `require()` API. If we're in
  // the browser, add `_` as a global object via a string identifier,
  // for Closure Compiler "advanced" mode.
  if (typeof exports !== 'undefined') {
    if (typeof module !== 'undefined' && module.exports) {
      exports = module.exports = _;
    }
    exports._ = _;
  } else {
    root._ = _;
  }

  // Current version.
  _.VERSION = '1.4.3';

  // Collection Functions
  // --------------------

  // The cornerstone, an `each` implementation, aka `forEach`.
  // Handles objects with the built-in `forEach`, arrays, and raw objects.
  // Delegates to **ECMAScript 5**'s native `forEach` if available.
  var each = _.each = _.forEach = function(obj, iterator, context) {
    if (obj == null) return;
    if (nativeForEach && obj.forEach === nativeForEach) {
      obj.forEach(iterator, context);
    } else if (obj.length === +obj.length) {
      for (var i = 0, l = obj.length; i < l; i++) {
        if (iterator.call(context, obj[i], i, obj) === breaker) return;
      }
    } else {
      for (var key in obj) {
        if (_.has(obj, key)) {
          if (iterator.call(context, obj[key], key, obj) === breaker) return;
        }
      }
    }
  };

  // Return the results of applying the iterator to each element.
  // Delegates to **ECMAScript 5**'s native `map` if available.
  _.map = _.collect = function(obj, iterator, context) {
    var results = [];
    if (obj == null) return results;
    if (nativeMap && obj.map === nativeMap) return obj.map(iterator, context);
    each(obj, function(value, index, list) {
      results[results.length] = iterator.call(context, value, index, list);
    });
    return results;
  };

  var reduceError = 'Reduce of empty array with no initial value';

  // **Reduce** builds up a single result from a list of values, aka `inject`,
  // or `foldl`. Delegates to **ECMAScript 5**'s native `reduce` if available.
  _.reduce = _.foldl = _.inject = function(obj, iterator, memo, context) {
    var initial = arguments.length > 2;
    if (obj == null) obj = [];
    if (nativeReduce && obj.reduce === nativeReduce) {
      if (context) iterator = _.bind(iterator, context);
      return initial ? obj.reduce(iterator, memo) : obj.reduce(iterator);
    }
    each(obj, function(value, index, list) {
      if (!initial) {
        memo = value;
        initial = true;
      } else {
        memo = iterator.call(context, memo, value, index, list);
      }
    });
    if (!initial) throw new TypeError(reduceError);
    return memo;
  };

  // The right-associative version of reduce, also known as `foldr`.
  // Delegates to **ECMAScript 5**'s native `reduceRight` if available.
  _.reduceRight = _.foldr = function(obj, iterator, memo, context) {
    var initial = arguments.length > 2;
    if (obj == null) obj = [];
    if (nativeReduceRight && obj.reduceRight === nativeReduceRight) {
      if (context) iterator = _.bind(iterator, context);
      return initial ? obj.reduceRight(iterator, memo) : obj.reduceRight(iterator);
    }
    var length = obj.length;
    if (length !== +length) {
      var keys = _.keys(obj);
      length = keys.length;
    }
    each(obj, function(value, index, list) {
      index = keys ? keys[--length] : --length;
      if (!initial) {
        memo = obj[index];
        initial = true;
      } else {
        memo = iterator.call(context, memo, obj[index], index, list);
      }
    });
    if (!initial) throw new TypeError(reduceError);
    return memo;
  };

  // Return the first value which passes a truth test. Aliased as `detect`.
  _.find = _.detect = function(obj, iterator, context) {
    var result;
    any(obj, function(value, index, list) {
      if (iterator.call(context, value, index, list)) {
        result = value;
        return true;
      }
    });
    return result;
  };

  // Return all the elements that pass a truth test.
  // Delegates to **ECMAScript 5**'s native `filter` if available.
  // Aliased as `select`.
  _.filter = _.select = function(obj, iterator, context) {
    var results = [];
    if (obj == null) return results;
    if (nativeFilter && obj.filter === nativeFilter) return obj.filter(iterator, context);
    each(obj, function(value, index, list) {
      if (iterator.call(context, value, index, list)) results[results.length] = value;
    });
    return results;
  };

  // Return all the elements for which a truth test fails.
  _.reject = function(obj, iterator, context) {
    return _.filter(obj, function(value, index, list) {
      return !iterator.call(context, value, index, list);
    }, context);
  };

  // Determine whether all of the elements match a truth test.
  // Delegates to **ECMAScript 5**'s native `every` if available.
  // Aliased as `all`.
  _.every = _.all = function(obj, iterator, context) {
    iterator || (iterator = _.identity);
    var result = true;
    if (obj == null) return result;
    if (nativeEvery && obj.every === nativeEvery) return obj.every(iterator, context);
    each(obj, function(value, index, list) {
      if (!(result = result && iterator.call(context, value, index, list))) return breaker;
    });
    return !!result;
  };

  // Determine if at least one element in the object matches a truth test.
  // Delegates to **ECMAScript 5**'s native `some` if available.
  // Aliased as `any`.
  var any = _.some = _.any = function(obj, iterator, context) {
    iterator || (iterator = _.identity);
    var result = false;
    if (obj == null) return result;
    if (nativeSome && obj.some === nativeSome) return obj.some(iterator, context);
    each(obj, function(value, index, list) {
      if (result || (result = iterator.call(context, value, index, list))) return breaker;
    });
    return !!result;
  };

  // Determine if the array or object contains a given value (using `===`).
  // Aliased as `include`.
  _.contains = _.include = function(obj, target) {
    if (obj == null) return false;
    if (nativeIndexOf && obj.indexOf === nativeIndexOf) return obj.indexOf(target) != -1;
    return any(obj, function(value) {
      return value === target;
    });
  };

  // Invoke a method (with arguments) on every item in a collection.
  _.invoke = function(obj, method) {
    var args = slice.call(arguments, 2);
    return _.map(obj, function(value) {
      return (_.isFunction(method) ? method : value[method]).apply(value, args);
    });
  };

  // Convenience version of a common use case of `map`: fetching a property.
  _.pluck = function(obj, key) {
    return _.map(obj, function(value){ return value[key]; });
  };

  // Convenience version of a common use case of `filter`: selecting only objects
  // with specific `key:value` pairs.
  _.where = function(obj, attrs) {
    if (_.isEmpty(attrs)) return [];
    return _.filter(obj, function(value) {
      for (var key in attrs) {
        if (attrs[key] !== value[key]) return false;
      }
      return true;
    });
  };

  // Return the maximum element or (element-based computation).
  // Can't optimize arrays of integers longer than 65,535 elements.
  // See: https://bugs.webkit.org/show_bug.cgi?id=80797
  _.max = function(obj, iterator, context) {
    if (!iterator && _.isArray(obj) && obj[0] === +obj[0] && obj.length < 65535) {
      return Math.max.apply(Math, obj);
    }
    if (!iterator && _.isEmpty(obj)) return -Infinity;
    var result = {computed : -Infinity, value: -Infinity};
    each(obj, function(value, index, list) {
      var computed = iterator ? iterator.call(context, value, index, list) : value;
      computed >= result.computed && (result = {value : value, computed : computed});
    });
    return result.value;
  };

  // Return the minimum element (or element-based computation).
  _.min = function(obj, iterator, context) {
    if (!iterator && _.isArray(obj) && obj[0] === +obj[0] && obj.length < 65535) {
      return Math.min.apply(Math, obj);
    }
    if (!iterator && _.isEmpty(obj)) return Infinity;
    var result = {computed : Infinity, value: Infinity};
    each(obj, function(value, index, list) {
      var computed = iterator ? iterator.call(context, value, index, list) : value;
      computed < result.computed && (result = {value : value, computed : computed});
    });
    return result.value;
  };

  // Shuffle an array.
  _.shuffle = function(obj) {
    var rand;
    var index = 0;
    var shuffled = [];
    each(obj, function(value) {
      rand = _.random(index++);
      shuffled[index - 1] = shuffled[rand];
      shuffled[rand] = value;
    });
    return shuffled;
  };

  // An internal function to generate lookup iterators.
  var lookupIterator = function(value) {
    return _.isFunction(value) ? value : function(obj){ return obj[value]; };
  };

  // Sort the object's values by a criterion produced by an iterator.
  _.sortBy = function(obj, value, context) {
    var iterator = lookupIterator(value);
    return _.pluck(_.map(obj, function(value, index, list) {
      return {
        value : value,
        index : index,
        criteria : iterator.call(context, value, index, list)
      };
    }).sort(function(left, right) {
      var a = left.criteria;
      var b = right.criteria;
      if (a !== b) {
        if (a > b || a === void 0) return 1;
        if (a < b || b === void 0) return -1;
      }
      return left.index < right.index ? -1 : 1;
    }), 'value');
  };

  // An internal function used for aggregate "group by" operations.
  var group = function(obj, value, context, behavior) {
    var result = {};
    var iterator = lookupIterator(value || _.identity);
    each(obj, function(value, index) {
      var key = iterator.call(context, value, index, obj);
      behavior(result, key, value);
    });
    return result;
  };

  // Groups the object's values by a criterion. Pass either a string attribute
  // to group by, or a function that returns the criterion.
  _.groupBy = function(obj, value, context) {
    return group(obj, value, context, function(result, key, value) {
      (_.has(result, key) ? result[key] : (result[key] = [])).push(value);
    });
  };

  // Counts instances of an object that group by a certain criterion. Pass
  // either a string attribute to count by, or a function that returns the
  // criterion.
  _.countBy = function(obj, value, context) {
    return group(obj, value, context, function(result, key) {
      if (!_.has(result, key)) result[key] = 0;
      result[key]++;
    });
  };

  // Use a comparator function to figure out the smallest index at which
  // an object should be inserted so as to maintain order. Uses binary search.
  _.sortedIndex = function(array, obj, iterator, context) {
    iterator = iterator == null ? _.identity : lookupIterator(iterator);
    var value = iterator.call(context, obj);
    var low = 0, high = array.length;
    while (low < high) {
      var mid = (low + high) >>> 1;
      iterator.call(context, array[mid]) < value ? low = mid + 1 : high = mid;
    }
    return low;
  };

  // Safely convert anything iterable into a real, live array.
  _.toArray = function(obj) {
    if (!obj) return [];
    if (_.isArray(obj)) return slice.call(obj);
    if (obj.length === +obj.length) return _.map(obj, _.identity);
    return _.values(obj);
  };

  // Return the number of elements in an object.
  _.size = function(obj) {
    if (obj == null) return 0;
    return (obj.length === +obj.length) ? obj.length : _.keys(obj).length;
  };

  // Array Functions
  // ---------------

  // Get the first element of an array. Passing **n** will return the first N
  // values in the array. Aliased as `head` and `take`. The **guard** check
  // allows it to work with `_.map`.
  _.first = _.head = _.take = function(array, n, guard) {
    if (array == null) return void 0;
    return (n != null) && !guard ? slice.call(array, 0, n) : array[0];
  };

  // Returns everything but the last entry of the array. Especially useful on
  // the arguments object. Passing **n** will return all the values in
  // the array, excluding the last N. The **guard** check allows it to work with
  // `_.map`.
  _.initial = function(array, n, guard) {
    return slice.call(array, 0, array.length - ((n == null) || guard ? 1 : n));
  };

  // Get the last element of an array. Passing **n** will return the last N
  // values in the array. The **guard** check allows it to work with `_.map`.
  _.last = function(array, n, guard) {
    if (array == null) return void 0;
    if ((n != null) && !guard) {
      return slice.call(array, Math.max(array.length - n, 0));
    } else {
      return array[array.length - 1];
    }
  };

  // Returns everything but the first entry of the array. Aliased as `tail` and `drop`.
  // Especially useful on the arguments object. Passing an **n** will return
  // the rest N values in the array. The **guard**
  // check allows it to work with `_.map`.
  _.rest = _.tail = _.drop = function(array, n, guard) {
    return slice.call(array, (n == null) || guard ? 1 : n);
  };

  // Trim out all falsy values from an array.
  _.compact = function(array) {
    return _.filter(array, _.identity);
  };

  // Internal implementation of a recursive `flatten` function.
  var flatten = function(input, shallow, output) {
    each(input, function(value) {
      if (_.isArray(value)) {
        shallow ? push.apply(output, value) : flatten(value, shallow, output);
      } else {
        output.push(value);
      }
    });
    return output;
  };

  // Return a completely flattened version of an array.
  _.flatten = function(array, shallow) {
    return flatten(array, shallow, []);
  };

  // Return a version of the array that does not contain the specified value(s).
  _.without = function(array) {
    return _.difference(array, slice.call(arguments, 1));
  };

  // Produce a duplicate-free version of the array. If the array has already
  // been sorted, you have the option of using a faster algorithm.
  // Aliased as `unique`.
  _.uniq = _.unique = function(array, isSorted, iterator, context) {
    if (_.isFunction(isSorted)) {
      context = iterator;
      iterator = isSorted;
      isSorted = false;
    }
    var initial = iterator ? _.map(array, iterator, context) : array;
    var results = [];
    var seen = [];
    each(initial, function(value, index) {
      if (isSorted ? (!index || seen[seen.length - 1] !== value) : !_.contains(seen, value)) {
        seen.push(value);
        results.push(array[index]);
      }
    });
    return results;
  };

  // Produce an array that contains the union: each distinct element from all of
  // the passed-in arrays.
  _.union = function() {
    return _.uniq(concat.apply(ArrayProto, arguments));
  };

  // Produce an array that contains every item shared between all the
  // passed-in arrays.
  _.intersection = function(array) {
    var rest = slice.call(arguments, 1);
    return _.filter(_.uniq(array), function(item) {
      return _.every(rest, function(other) {
        return _.indexOf(other, item) >= 0;
      });
    });
  };

  // Take the difference between one array and a number of other arrays.
  // Only the elements present in just the first array will remain.
  _.difference = function(array) {
    var rest = concat.apply(ArrayProto, slice.call(arguments, 1));
    return _.filter(array, function(value){ return !_.contains(rest, value); });
  };

  // Zip together multiple lists into a single array -- elements that share
  // an index go together.
  _.zip = function() {
    var args = slice.call(arguments);
    var length = _.max(_.pluck(args, 'length'));
    var results = new Array(length);
    for (var i = 0; i < length; i++) {
      results[i] = _.pluck(args, "" + i);
    }
    return results;
  };

  // Converts lists into objects. Pass either a single array of `[key, value]`
  // pairs, or two parallel arrays of the same length -- one of keys, and one of
  // the corresponding values.
  _.object = function(list, values) {
    if (list == null) return {};
    var result = {};
    for (var i = 0, l = list.length; i < l; i++) {
      if (values) {
        result[list[i]] = values[i];
      } else {
        result[list[i][0]] = list[i][1];
      }
    }
    return result;
  };

  // If the browser doesn't supply us with indexOf (I'm looking at you, **MSIE**),
  // we need this function. Return the position of the first occurrence of an
  // item in an array, or -1 if the item is not included in the array.
  // Delegates to **ECMAScript 5**'s native `indexOf` if available.
  // If the array is large and already in sort order, pass `true`
  // for **isSorted** to use binary search.
  _.indexOf = function(array, item, isSorted) {
    if (array == null) return -1;
    var i = 0, l = array.length;
    if (isSorted) {
      if (typeof isSorted == 'number') {
        i = (isSorted < 0 ? Math.max(0, l + isSorted) : isSorted);
      } else {
        i = _.sortedIndex(array, item);
        return array[i] === item ? i : -1;
      }
    }
    if (nativeIndexOf && array.indexOf === nativeIndexOf) return array.indexOf(item, isSorted);
    for (; i < l; i++) if (array[i] === item) return i;
    return -1;
  };

  // Delegates to **ECMAScript 5**'s native `lastIndexOf` if available.
  _.lastIndexOf = function(array, item, from) {
    if (array == null) return -1;
    var hasIndex = from != null;
    if (nativeLastIndexOf && array.lastIndexOf === nativeLastIndexOf) {
      return hasIndex ? array.lastIndexOf(item, from) : array.lastIndexOf(item);
    }
    var i = (hasIndex ? from : array.length);
    while (i--) if (array[i] === item) return i;
    return -1;
  };

  // Generate an integer Array containing an arithmetic progression. A port of
  // the native Python `range()` function. See
  // [the Python documentation](http://docs.python.org/library/functions.html#range).
  _.range = function(start, stop, step) {
    if (arguments.length <= 1) {
      stop = start || 0;
      start = 0;
    }
    step = arguments[2] || 1;

    var len = Math.max(Math.ceil((stop - start) / step), 0);
    var idx = 0;
    var range = new Array(len);

    while(idx < len) {
      range[idx++] = start;
      start += step;
    }

    return range;
  };

  // Function (ahem) Functions
  // ------------------

  // Reusable constructor function for prototype setting.
  var ctor = function(){};

  // Create a function bound to a given object (assigning `this`, and arguments,
  // optionally). Binding with arguments is also known as `curry`.
  // Delegates to **ECMAScript 5**'s native `Function.bind` if available.
  // We check for `func.bind` first, to fail fast when `func` is undefined.
  _.bind = function(func, context) {
    var args, bound;
    if (func.bind === nativeBind && nativeBind) return nativeBind.apply(func, slice.call(arguments, 1));
    if (!_.isFunction(func)) throw new TypeError;
    args = slice.call(arguments, 2);
    return bound = function() {
      if (!(this instanceof bound)) return func.apply(context, args.concat(slice.call(arguments)));
      ctor.prototype = func.prototype;
      var self = new ctor;
      ctor.prototype = null;
      var result = func.apply(self, args.concat(slice.call(arguments)));
      if (Object(result) === result) return result;
      return self;
    };
  };

  // Bind all of an object's methods to that object. Useful for ensuring that
  // all callbacks defined on an object belong to it.
  _.bindAll = function(obj) {
    var funcs = slice.call(arguments, 1);
    if (funcs.length == 0) funcs = _.functions(obj);
    each(funcs, function(f) { obj[f] = _.bind(obj[f], obj); });
    return obj;
  };

  // Memoize an expensive function by storing its results.
  _.memoize = function(func, hasher) {
    var memo = {};
    hasher || (hasher = _.identity);
    return function() {
      var key = hasher.apply(this, arguments);
      return _.has(memo, key) ? memo[key] : (memo[key] = func.apply(this, arguments));
    };
  };

  // Delays a function for the given number of milliseconds, and then calls
  // it with the arguments supplied.
  _.delay = function(func, wait) {
    var args = slice.call(arguments, 2);
    return setTimeout(function(){ return func.apply(null, args); }, wait);
  };

  // Defers a function, scheduling it to run after the current call stack has
  // cleared.
  _.defer = function(func) {
    return _.delay.apply(_, [func, 1].concat(slice.call(arguments, 1)));
  };

  // Returns a function, that, when invoked, will only be triggered at most once
  // during a given window of time.
  _.throttle = function(func, wait) {
    var context, args, timeout, result;
    var previous = 0;
    var later = function() {
      previous = new Date;
      timeout = null;
      result = func.apply(context, args);
    };
    return function() {
      var now = new Date;
      var remaining = wait - (now - previous);
      context = this;
      args = arguments;
      if (remaining <= 0) {
        clearTimeout(timeout);
        timeout = null;
        previous = now;
        result = func.apply(context, args);
      } else if (!timeout) {
        timeout = setTimeout(later, remaining);
      }
      return result;
    };
  };

  // Returns a function, that, as long as it continues to be invoked, will not
  // be triggered. The function will be called after it stops being called for
  // N milliseconds. If `immediate` is passed, trigger the function on the
  // leading edge, instead of the trailing.
  _.debounce = function(func, wait, immediate) {
    var timeout, result;
    return function() {
      var context = this, args = arguments;
      var later = function() {
        timeout = null;
        if (!immediate) result = func.apply(context, args);
      };
      var callNow = immediate && !timeout;
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
      if (callNow) result = func.apply(context, args);
      return result;
    };
  };

  // Returns a function that will be executed at most one time, no matter how
  // often you call it. Useful for lazy initialization.
  _.once = function(func) {
    var ran = false, memo;
    return function() {
      if (ran) return memo;
      ran = true;
      memo = func.apply(this, arguments);
      func = null;
      return memo;
    };
  };

  // Returns the first function passed as an argument to the second,
  // allowing you to adjust arguments, run code before and after, and
  // conditionally execute the original function.
  _.wrap = function(func, wrapper) {
    return function() {
      var args = [func];
      push.apply(args, arguments);
      return wrapper.apply(this, args);
    };
  };

  // Returns a function that is the composition of a list of functions, each
  // consuming the return value of the function that follows.
  _.compose = function() {
    var funcs = arguments;
    return function() {
      var args = arguments;
      for (var i = funcs.length - 1; i >= 0; i--) {
        args = [funcs[i].apply(this, args)];
      }
      return args[0];
    };
  };

  // Returns a function that will only be executed after being called N times.
  _.after = function(times, func) {
    if (times <= 0) return func();
    return function() {
      if (--times < 1) {
        return func.apply(this, arguments);
      }
    };
  };

  // Object Functions
  // ----------------

  // Retrieve the names of an object's properties.
  // Delegates to **ECMAScript 5**'s native `Object.keys`
  _.keys = nativeKeys || function(obj) {
    if (obj !== Object(obj)) throw new TypeError('Invalid object');
    var keys = [];
    for (var key in obj) if (_.has(obj, key)) keys[keys.length] = key;
    return keys;
  };

  // Retrieve the values of an object's properties.
  _.values = function(obj) {
    var values = [];
    for (var key in obj) if (_.has(obj, key)) values.push(obj[key]);
    return values;
  };

  // Convert an object into a list of `[key, value]` pairs.
  _.pairs = function(obj) {
    var pairs = [];
    for (var key in obj) if (_.has(obj, key)) pairs.push([key, obj[key]]);
    return pairs;
  };

  // Invert the keys and values of an object. The values must be serializable.
  _.invert = function(obj) {
    var result = {};
    for (var key in obj) if (_.has(obj, key)) result[obj[key]] = key;
    return result;
  };

  // Return a sorted list of the function names available on the object.
  // Aliased as `methods`
  _.functions = _.methods = function(obj) {
    var names = [];
    for (var key in obj) {
      if (_.isFunction(obj[key])) names.push(key);
    }
    return names.sort();
  };

  // Extend a given object with all the properties in passed-in object(s).
  _.extend = function(obj) {
    each(slice.call(arguments, 1), function(source) {
      if (source) {
        for (var prop in source) {
          obj[prop] = source[prop];
        }
      }
    });
    return obj;
  };

  // Return a copy of the object only containing the whitelisted properties.
  _.pick = function(obj) {
    var copy = {};
    var keys = concat.apply(ArrayProto, slice.call(arguments, 1));
    each(keys, function(key) {
      if (key in obj) copy[key] = obj[key];
    });
    return copy;
  };

   // Return a copy of the object without the blacklisted properties.
  _.omit = function(obj) {
    var copy = {};
    var keys = concat.apply(ArrayProto, slice.call(arguments, 1));
    for (var key in obj) {
      if (!_.contains(keys, key)) copy[key] = obj[key];
    }
    return copy;
  };

  // Fill in a given object with default properties.
  _.defaults = function(obj) {
    each(slice.call(arguments, 1), function(source) {
      if (source) {
        for (var prop in source) {
          if (obj[prop] == null) obj[prop] = source[prop];
        }
      }
    });
    return obj;
  };

  // Create a (shallow-cloned) duplicate of an object.
  _.clone = function(obj) {
    if (!_.isObject(obj)) return obj;
    return _.isArray(obj) ? obj.slice() : _.extend({}, obj);
  };

  // Invokes interceptor with the obj, and then returns obj.
  // The primary purpose of this method is to "tap into" a method chain, in
  // order to perform operations on intermediate results within the chain.
  _.tap = function(obj, interceptor) {
    interceptor(obj);
    return obj;
  };

  // Internal recursive comparison function for `isEqual`.
  var eq = function(a, b, aStack, bStack) {
    // Identical objects are equal. `0 === -0`, but they aren't identical.
    // See the Harmony `egal` proposal: http://wiki.ecmascript.org/doku.php?id=harmony:egal.
    if (a === b) return a !== 0 || 1 / a == 1 / b;
    // A strict comparison is necessary because `null == undefined`.
    if (a == null || b == null) return a === b;
    // Unwrap any wrapped objects.
    if (a instanceof _) a = a._wrapped;
    if (b instanceof _) b = b._wrapped;
    // Compare `[[Class]]` names.
    var className = toString.call(a);
    if (className != toString.call(b)) return false;
    switch (className) {
      // Strings, numbers, dates, and booleans are compared by value.
      case '[object String]':
        // Primitives and their corresponding object wrappers are equivalent; thus, `"5"` is
        // equivalent to `new String("5")`.
        return a == String(b);
      case '[object Number]':
        // `NaN`s are equivalent, but non-reflexive. An `egal` comparison is performed for
        // other numeric values.
        return a != +a ? b != +b : (a == 0 ? 1 / a == 1 / b : a == +b);
      case '[object Date]':
      case '[object Boolean]':
        // Coerce dates and booleans to numeric primitive values. Dates are compared by their
        // millisecond representations. Note that invalid dates with millisecond representations
        // of `NaN` are not equivalent.
        return +a == +b;
      // RegExps are compared by their source patterns and flags.
      case '[object RegExp]':
        return a.source == b.source &&
               a.global == b.global &&
               a.multiline == b.multiline &&
               a.ignoreCase == b.ignoreCase;
    }
    if (typeof a != 'object' || typeof b != 'object') return false;
    // Assume equality for cyclic structures. The algorithm for detecting cyclic
    // structures is adapted from ES 5.1 section 15.12.3, abstract operation `JO`.
    var length = aStack.length;
    while (length--) {
      // Linear search. Performance is inversely proportional to the number of
      // unique nested structures.
      if (aStack[length] == a) return bStack[length] == b;
    }
    // Add the first object to the stack of traversed objects.
    aStack.push(a);
    bStack.push(b);
    var size = 0, result = true;
    // Recursively compare objects and arrays.
    if (className == '[object Array]') {
      // Compare array lengths to determine if a deep comparison is necessary.
      size = a.length;
      result = size == b.length;
      if (result) {
        // Deep compare the contents, ignoring non-numeric properties.
        while (size--) {
          if (!(result = eq(a[size], b[size], aStack, bStack))) break;
        }
      }
    } else {
      // Objects with different constructors are not equivalent, but `Object`s
      // from different frames are.
      var aCtor = a.constructor, bCtor = b.constructor;
      if (aCtor !== bCtor && !(_.isFunction(aCtor) && (aCtor instanceof aCtor) &&
                               _.isFunction(bCtor) && (bCtor instanceof bCtor))) {
        return false;
      }
      // Deep compare objects.
      for (var key in a) {
        if (_.has(a, key)) {
          // Count the expected number of properties.
          size++;
          // Deep compare each member.
          if (!(result = _.has(b, key) && eq(a[key], b[key], aStack, bStack))) break;
        }
      }
      // Ensure that both objects contain the same number of properties.
      if (result) {
        for (key in b) {
          if (_.has(b, key) && !(size--)) break;
        }
        result = !size;
      }
    }
    // Remove the first object from the stack of traversed objects.
    aStack.pop();
    bStack.pop();
    return result;
  };

  // Perform a deep comparison to check if two objects are equal.
  _.isEqual = function(a, b) {
    return eq(a, b, [], []);
  };

  // Is a given array, string, or object empty?
  // An "empty" object has no enumerable own-properties.
  _.isEmpty = function(obj) {
    if (obj == null) return true;
    if (_.isArray(obj) || _.isString(obj)) return obj.length === 0;
    for (var key in obj) if (_.has(obj, key)) return false;
    return true;
  };

  // Is a given value a DOM element?
  _.isElement = function(obj) {
    return !!(obj && obj.nodeType === 1);
  };

  // Is a given value an array?
  // Delegates to ECMA5's native Array.isArray
  _.isArray = nativeIsArray || function(obj) {
    return toString.call(obj) == '[object Array]';
  };

  // Is a given variable an object?
  _.isObject = function(obj) {
    return obj === Object(obj);
  };

  // Add some isType methods: isArguments, isFunction, isString, isNumber, isDate, isRegExp.
  each(['Arguments', 'Function', 'String', 'Number', 'Date', 'RegExp'], function(name) {
    _['is' + name] = function(obj) {
      return toString.call(obj) == '[object ' + name + ']';
    };
  });

  // Define a fallback version of the method in browsers (ahem, IE), where
  // there isn't any inspectable "Arguments" type.
  if (!_.isArguments(arguments)) {
    _.isArguments = function(obj) {
      return !!(obj && _.has(obj, 'callee'));
    };
  }

  // Optimize `isFunction` if appropriate.
  if (typeof (/./) !== 'function') {
    _.isFunction = function(obj) {
      return typeof obj === 'function';
    };
  }

  // Is a given object a finite number?
  _.isFinite = function(obj) {
    return isFinite(obj) && !isNaN(parseFloat(obj));
  };

  // Is the given value `NaN`? (NaN is the only number which does not equal itself).
  _.isNaN = function(obj) {
    return _.isNumber(obj) && obj != +obj;
  };

  // Is a given value a boolean?
  _.isBoolean = function(obj) {
    return obj === true || obj === false || toString.call(obj) == '[object Boolean]';
  };

  // Is a given value equal to null?
  _.isNull = function(obj) {
    return obj === null;
  };

  // Is a given variable undefined?
  _.isUndefined = function(obj) {
    return obj === void 0;
  };

  // Shortcut function for checking if an object has a given property directly
  // on itself (in other words, not on a prototype).
  _.has = function(obj, key) {
    return hasOwnProperty.call(obj, key);
  };

  // Utility Functions
  // -----------------

  // Run Underscore.js in *noConflict* mode, returning the `_` variable to its
  // previous owner. Returns a reference to the Underscore object.
  _.noConflict = function() {
    root._ = previousUnderscore;
    return this;
  };

  // Keep the identity function around for default iterators.
  _.identity = function(value) {
    return value;
  };

  // Run a function **n** times.
  _.times = function(n, iterator, context) {
    var accum = Array(n);
    for (var i = 0; i < n; i++) accum[i] = iterator.call(context, i);
    return accum;
  };

  // Return a random integer between min and max (inclusive).
  _.random = function(min, max) {
    if (max == null) {
      max = min;
      min = 0;
    }
    return min + (0 | Math.random() * (max - min + 1));
  };

  // List of HTML entities for escaping.
  var entityMap = {
    escape: {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#x27;',
      '/': '&#x2F;'
    }
  };
  entityMap.unescape = _.invert(entityMap.escape);

  // Regexes containing the keys and values listed immediately above.
  var entityRegexes = {
    escape:   new RegExp('[' + _.keys(entityMap.escape).join('') + ']', 'g'),
    unescape: new RegExp('(' + _.keys(entityMap.unescape).join('|') + ')', 'g')
  };

  // Functions for escaping and unescaping strings to/from HTML interpolation.
  _.each(['escape', 'unescape'], function(method) {
    _[method] = function(string) {
      if (string == null) return '';
      return ('' + string).replace(entityRegexes[method], function(match) {
        return entityMap[method][match];
      });
    };
  });

  // If the value of the named property is a function then invoke it;
  // otherwise, return it.
  _.result = function(object, property) {
    if (object == null) return null;
    var value = object[property];
    return _.isFunction(value) ? value.call(object) : value;
  };

  // Add your own custom functions to the Underscore object.
  _.mixin = function(obj) {
    each(_.functions(obj), function(name){
      var func = _[name] = obj[name];
      _.prototype[name] = function() {
        var args = [this._wrapped];
        push.apply(args, arguments);
        return result.call(this, func.apply(_, args));
      };
    });
  };

  // Generate a unique integer id (unique within the entire client session).
  // Useful for temporary DOM ids.
  var idCounter = 0;
  _.uniqueId = function(prefix) {
    var id = '' + ++idCounter;
    return prefix ? prefix + id : id;
  };

  // By default, Underscore uses ERB-style template delimiters, change the
  // following template settings to use alternative delimiters.
  _.templateSettings = {
    evaluate    : /<%([\s\S]+?)%>/g,
    interpolate : /<%=([\s\S]+?)%>/g,
    escape      : /<%-([\s\S]+?)%>/g
  };

  // When customizing `templateSettings`, if you don't want to define an
  // interpolation, evaluation or escaping regex, we need one that is
  // guaranteed not to match.
  var noMatch = /(.)^/;

  // Certain characters need to be escaped so that they can be put into a
  // string literal.
  var escapes = {
    "'":      "'",
    '\\':     '\\',
    '\r':     'r',
    '\n':     'n',
    '\t':     't',
    '\u2028': 'u2028',
    '\u2029': 'u2029'
  };

  var escaper = /\\|'|\r|\n|\t|\u2028|\u2029/g;

  // JavaScript micro-templating, similar to John Resig's implementation.
  // Underscore templating handles arbitrary delimiters, preserves whitespace,
  // and correctly escapes quotes within interpolated code.
  _.template = function(text, data, settings) {
    settings = _.defaults({}, settings, _.templateSettings);

    // Combine delimiters into one regular expression via alternation.
    var matcher = new RegExp([
      (settings.escape || noMatch).source,
      (settings.interpolate || noMatch).source,
      (settings.evaluate || noMatch).source
    ].join('|') + '|$', 'g');

    // Compile the template source, escaping string literals appropriately.
    var index = 0;
    var source = "__p+='";
    text.replace(matcher, function(match, escape, interpolate, evaluate, offset) {
      source += text.slice(index, offset)
        .replace(escaper, function(match) { return '\\' + escapes[match]; });

      if (escape) {
        source += "'+\n((__t=(" + escape + "))==null?'':_.escape(__t))+\n'";
      }
      if (interpolate) {
        source += "'+\n((__t=(" + interpolate + "))==null?'':__t)+\n'";
      }
      if (evaluate) {
        source += "';\n" + evaluate + "\n__p+='";
      }
      index = offset + match.length;
      return match;
    });
    source += "';\n";

    // If a variable is not specified, place data values in local scope.
    if (!settings.variable) source = 'with(obj||{}){\n' + source + '}\n';

    source = "var __t,__p='',__j=Array.prototype.join," +
      "print=function(){__p+=__j.call(arguments,'');};\n" +
      source + "return __p;\n";

    try {
      var render = new Function(settings.variable || 'obj', '_', source);
    } catch (e) {
      e.source = source;
      throw e;
    }

    if (data) return render(data, _);
    var template = function(data) {
      return render.call(this, data, _);
    };

    // Provide the compiled function source as a convenience for precompilation.
    template.source = 'function(' + (settings.variable || 'obj') + '){\n' + source + '}';

    return template;
  };

  // Add a "chain" function, which will delegate to the wrapper.
  _.chain = function(obj) {
    return _(obj).chain();
  };

  // OOP
  // ---------------
  // If Underscore is called as a function, it returns a wrapped object that
  // can be used OO-style. This wrapper holds altered versions of all the
  // underscore functions. Wrapped objects may be chained.

  // Helper function to continue chaining intermediate results.
  var result = function(obj) {
    return this._chain ? _(obj).chain() : obj;
  };

  // Add all of the Underscore functions to the wrapper object.
  _.mixin(_);

  // Add all mutator Array functions to the wrapper.
  each(['pop', 'push', 'reverse', 'shift', 'sort', 'splice', 'unshift'], function(name) {
    var method = ArrayProto[name];
    _.prototype[name] = function() {
      var obj = this._wrapped;
      method.apply(obj, arguments);
      if ((name == 'shift' || name == 'splice') && obj.length === 0) delete obj[0];
      return result.call(this, obj);
    };
  });

  // Add all accessor Array functions to the wrapper.
  each(['concat', 'join', 'slice'], function(name) {
    var method = ArrayProto[name];
    _.prototype[name] = function() {
      return result.call(this, method.apply(this._wrapped, arguments));
    };
  });

  _.extend(_.prototype, {

    // Start chaining a wrapped Underscore object.
    chain: function() {
      this._chain = true;
      return this;
    },

    // Extracts the result from a wrapped and chained object.
    value: function() {
      return this._wrapped;
    }

  });

}).call(this);

define('underscore', [], function() { return _; });

define("underscore/underscore", function(){});

define('validator/logger',['underscore'], function(_) {

    // if there's a browser console, use it. Bind the level in case the browser doesn't differentiate.
    // if native methods are available, this preserves line numbers.

    var cons = window.console;

    var fallback = cons && cons.log || function noop(){};

    var Logger;

    // IE doesn't let us use these as functions...
    if (cons && typeof cons.info == "object") {
        Logger = {
            info: function(msg, obj) {
                cons.info("[INFO]", msg, obj);
            },
            warn: function(msg, obj) {
                cons.warn("[WARN]", msg, obj);
            },
            error: function(msg, obj) {
                cons.info("[ERROR]", msg, obj);
            }
        };
    } else {
        Logger =  {
            info: _(cons && cons.info || fallback).bind(cons, "[INFO]"),
            warn: _(cons && cons.warn || fallback).bind(cons, "[WARN]"),
            error: _(cons && cons.info || fallback).bind(cons, "[ERROR]")
        };
    }


    return Logger;
});

define('validator/schema',[], {
    "type":"object",
    "properties":{
        "config":{
            "type":"object",
            "properties":{
                "version":{"type":["string","number"]},
                "signature_algorithm":{"type":"string"}
            }
        },
        "signature":{
            "type":"object",
            "properties":{
                "user":{"type":"string"},
                "page":{"type":"string"},
                "primary_mo":{"type":"string"},
                "mos":{"type":"string"}
            }
        },
        "user":{
            "type":"object",
            "properties":{
                "id":{
                    "type":"array",
                    "items":{
                        "type":"object",
                        "properties":{
                            "id":{"type":"string"},
                            "type":{"type":"string"}
                        }
                    }
                },
                "email":{
                    "type":"array",
                    "items":{
                        "type":"object",
                        "properties":{
                            "clear":{"type":"string"},
                            "hashed":{"type":"string"},
                            "opt_out":{"type":"boolean"}
                        }
                    }
                },
                "marketing_area":{"type":"string"},
                "profile":{
                    "type":"object",
                    "properties":{
                        "name":{
                            "type":"object",
                            "javaType":"UserName",
                            "properties":{
                                "prefix":{"type":"string"},
                                "first":{"type":"string"},
                                "middle":{"type":"string"},
                                "last":{"type":"string"},
                                "postfix":{"type":"string"}
                            }
                        },
                        "age":{"type":"number"},
                        "dob":{"type":"string"},
                        "gender":{"type":"string"},
                        "preferred_language":{"type":"string"},
                        "profile_pic_url":{"type":"string"},
                        "address":{
                            "type":"object",
                            "properties":{
                                "city":{"type":"string"},
                                "state":{"type":"string"},
                                "country":{"type":"string"},
                                "postal_code":{"type":"string"}
                            }
                        }
                    }
                },
                "use_path_for_tracking": {
                    "type":"boolean"
                },
                "tracking":{
                    "type":"array",
                    "items":{
                        "type":"object",
                        "javaType":"TrackingParameter",
                        "properties":{
                            "name":{"type":"string"},
                            "value":{"type":"string"}
                        }
                    }
                },
                "tags":{
                    "type":"array",
                    "items":{"type":"string"}
                }
            }
        },
        "user_base64":{"type":"string"},
        "user_e":{"type":"string"},
        "page_base64":{"type":"string"},
        "page":{
            "type":"object",
            "properties":{
                "disable":{"type":"boolean"},
                "is_homepage":{"type":"boolean"},
                "is_new_registration":{"type":"boolean"},
                "marketing_area":{"type":"string"},
                "primary_category":{"type":"string"},
                "tags":{
                    "type":"array",
                    "items":{"type":"string"}
                },
                "language":{"type":"string"},
                "user_filter" : {
                    "type" : "array",
                    "items" : {
                        "type" :"object",
                        "javaType" : "UserFilterId",
                        "properties" : {
                            "id" : { "type" : "string"},
                            "type" : { "type" : "string"}
                        }
                    }
                },
                "tracking":{
                    "type":"array",
                    "items":{
                        "type":"object",
                        "javaType":"TrackingParameter",
                        "properties":{
                            "name":{"type":"string"},
                            "value":{"type":"string"}
                        }
                    }
                },
                "actions": {
                    "type":"object",
                    "javaType":"PageActions",
                    "properties":{
                        "purchase": {
                            "type":"object",
                            "javaType":"PagePurchase",
                            "properties": {
                                "pending":{"type":"boolean"},
                                "order_id":{"type":"string"},
                                "total":{"type":"number"},
                                "currency":{"type":"string"},
                                "publish_facebook_actions":{"type":"boolean"},
                                "items":{
                                    "type":"array",
                                    "items":{
                                        "type":"object",
                                        "javaType":"PurchasedItem",
                                        "properties":{
                                            "id":{
                                                "type":"object",
                                                "properties":{
                                                    "id":{"type":"string"},
                                                    "type":{"type":"string"}
                                                }
                                            },
                                            "price":{
                                                "type":"object",
                                                "properties":{
                                                    "actual_paid": {"type":["number","string"]},
                                                    "currency":{"type":"string"}
                                                }
                                            },
                                            "seat":{"type":"string"}
                                        }
                                    }
                                }
                            }
                        },
                        "list_for_sale": {
                            "type":"object",
                            "javaType":"PageListForSale",
                            "properties": {
                                "publish_facebook_actions":{"type":"boolean"},
                                "items":{
                                    "type":"array",
                                    "items":{
                                        "type":"object",
                                        "javaType":"ItemForSale",
                                        "properties":{
                                            "id":{
                                                "type":"object",
                                                "properties":{
                                                    "id":{"type":"string"},
                                                    "type":{"type":"string"}
                                                }
                                            },
                                            "list_price":{
                                                "type":"object",
                                                "properties":{
                                                    "list_price": {"type":["number","string"]},
                                                    "currency":{"type":"string"}
                                                }
                                            },
                                            "seat":{"type":"string"}
                                        }
                                    }
                                }
                            }
                        },
                        "new_registration":{"type":"boolean"}
                    }
                },
                "shopping_cart":{
                    "type":"object",
                    "properties":{
                        "is_shopping_cart":{"type":"boolean"},
                        "pre_purchase":{"type":"boolean"},
                        "order_id":{"type":"string"},
                        "total":{"type":"number"},
                        "currency":{"type":"string"},
                        "ship_to_address":{"type":"string"},
                        "bill_to_address":{"type":"string"}
                    }
                }
            }
        },
        "primary_mo_base64":{"type":"string"},
        "primary_mo_etag":{"type":"string"},
        "primary_mo":{
            "type":"object",
            "javaType":"RawMo",
            "properties":{
                "product_date":{
                    "type":"array",
                    "items":{
                        "type":"object",
                        "javaType":"TimeSpan",
                        "properties":{
                            "start":{
                                "type":"object",
                                "javaType":"Date",
                                "properties":{
                                    "date":{"type":"string"},
                                    "time":{"type":"string"},
                                    "timezone":{"type":"string"}
                                }
                            },
                            "end":{
                                "type":"object",
                                "javaType":"Date",
                                "properties":{
                                    "date":{"type":"string"},
                                    "time":{"type":"string"},
                                    "timezone":{"type":"string"}
                                }
                            }
                        }
                    }
                },
                "release_date": {
                    "type": "object",
                    "javaType": "Date",
                    "properties": {
                        "date": {"type": "string"},
                        "time": {"type": "string"},
                        "timezone": {"type": "string"}
                    }
                },
                "promotion":{
                    "type":"object",
                    "javaType":"RawPromotion",
                    "properties":{
                        "do_promote":{"type":["boolean","string"]},
                        "inventory_left":{"type":"string"},
                        "weight":{"type":"string"},
                        "promo_style_tags":{
                            "type":"array",
                            "items":{"type":"string"}
                        }
                    }
                },
                "id":{
                    "type":"array",
                    "items":{
                        "type":"object",
                        "properties":{
                            "id":{"type":"string"},
                            "type":{"type":"string"}
                        }
                    }
                },
                "location":{
                    "type":"object",
                    "javaType":"RawLocation",
                    "properties":{
                        "id":{"type":"string"},
                        "language":{"type":"string"},
                        "name":{"type":"string"},
                        "url":{"type":"string"},
                        "address_line1":{"type":"string"},
                        "address_line2":{"type":"string"},
                        "city":{"type":"string"},
                        "state":{"type":"string"},
                        "country":{"type":"string"},
                        "postal_code":{"type":"string"},
                        "latitude":{"type":"string"},
                        "longitude":{"type":"string"}
                    }
                },
                "locations": {
                    "type":"array",
                    "items":{
                        "type":"object",
                        "javaType":"RawLocation"
                    }
                },
                "name":{
                    "type":"array",
                    "items":{
                        "type":"object",
                        "properties":{
                            "name":{"type":"string"},
                            "language":{"type":"string"},
                            "primary":{"type":"boolean"}
                        }
                    }
                },
                "description":{
                    "type":"array",
                    "items":{
                        "type":"object",
                        "properties":{
                            "description":{"type":"string"},
                            "language":{"type":"string"}
                        }
                    }
                },
                "marketing_area":{
                    "type":"array",
                    "items":{"type":"string"}
                },
                "primary_tag":{"type":"string"},
                "tags":{
                    "type":"array",
                    "items":{"type":"string"}
                },
                "categories": {
                    "type": "array",
                    "items": {"type": "string"}
                },
                "facebook":{
                    "type":"object",
                    "javaType":"RawFacebook",
                    "properties":{
                        "event_id":{"type":"string"},
                        "create_event":{"type":"boolean"}
                    }
                },
                "url":{
                    "type":"object",
                    "properties":{
                        "detail":{"type":"string"},
                        "purchase":{"type":"string"},
                        "picture":{
                            "type":"object",
                            "properties":{
                                "primary":{"type":"string"},
                                "primary_secure":{"type":"string"},
                                "small":{"type":"string"},
                                "small_secure":{"type":"string"},
                                "large":{"type":"string"},
                                "large_secure":{"type":"string"}
                            }
                        },
                        "video":{"type":"string"}
                    }
                },
                "price":{
                    "type":"object",
                    "properties":{
                        "actual_paid": {"type":["number","string"]},
                        "sale_price": {"type" : ["number","string"]},
                        "retail_price": {"type" : ["number","string"]},
                        "description" : { "type" : "string"},
                        "currency":{"type":"string"}
                    }
                }
            }
        },
        "mos_e":{"type":"string"},
        "mos_base64":{"type":"string"},
        "mos_etags":{
            "type":"array",
            "items":{
                "type":"string"
            }
        },
        "mos":{
            "type":"array",
            "maxItems":15,
            "items":{
                "type":"object",
                "javaType":"RawMo",
                "properties":{
                    "product_date":{
                        "type":"array",
                        "items":{
                            "type":"object",
                            "javaType":"TimeSpan",
                            "properties":{
                                "start":{
                                    "type":"object",
                                    "javaType":"Date",
                                    "properties":{
                                        "date":{"type":"string"},
                                        "time":{"type":"string"},
                                        "timezone":{"type":"string"}
                                    }
                                },
                                "end":{
                                    "type":"object",
                                    "javaType":"Date",
                                    "properties":{
                                        "date":{"type":"string"},
                                        "time":{"type":"string"},
                                        "timezone":{"type":"string"}
                                    }
                                }
                            }
                        }
                    },
                    "release_date": {
                        "type": "object",
                        "javaType": "Date",
                        "properties": {
                            "date": {"type": "string"},
                            "time": {"type": "string"},
                            "timezone": {"type": "string"}
                        }
                    },
                    "promotion":{
                        "type":"object",
                        "javaType":"RawPromotion",
                        "properties":{
                            "do_promote":{"type":["boolean","string"]},
                            "inventory_left":{"type":"string"},
                            "weight":{"type":"string"},
                            "promo_style_tags":{
                                "type":"array",
                                "items":{"type":"string"}
                            }
                        }
                    },
                    "id":{
                        "type":"array",
                        "items":{
                            "type":"object",
                            "properties":{
                                "id":{"type":"string"},
                                "type":{"type":"string"}
                            }
                        }
                    },
                    "location":{
                        "type":"object",
                        "javaType":"RawLocation",
                        "properties":{
                            "id":{"type":"string"},
                            "language":{"type":"string"},
                            "name":{"type":"string"},
                            "url":{"type":"string"},
                            "address_line1":{"type":"string"},
                            "address_line2":{"type":"string"},
                            "city":{"type":"string"},
                            "state":{"type":"string"},
                            "country":{"type":"string"},
                            "postal_code":{"type":"string"},
                            "latitude":{"type":"string"},
                            "longitude":{"type":"string"}
                        }
                    },
                    "locations": {
                        "type":"array",
                        "items":{
                            "type":"object",
                            "javaType":"RawLocation"
                        }
                    },
                    "name":{
                        "type":"array",
                        "items":{
                            "type":"object",
                            "properties":{
                                "name":{"type":"string"},
                                "language":{"type":"string"},
                                "primary":{"type":"boolean"}
                            }
                        }
                    },
                    "description":{
                        "type":"array",
                        "items":{
                            "type":"object",
                            "properties":{
                                "description":{"type":"string"},
                                "language":{"type":"string"}
                            }
                        }
                    },
                    "marketing_area":{
                        "type":"array",
                        "items":{"type":"string"}
                    },
                    "primary_tag":{"type":"string"},
                    "tags":{
                        "type":"array",
                        "items":{"type":"string"}
                    },
                    "categories":{
                        "type":"array",
                        "items":{"type":"string"}
                    },
                    "facebook":{
                        "type":"object",
                        "javaType":"RawFacebook",
                        "properties":{
                            "event_id":{"type":"string"},
                            "create_event":{"type":"boolean"}
                        }
                    },
                    "url":{
                        "type":"object",
                        "properties":{
                            "detail":{"type":"string"},
                            "purchase":{"type":"string"},
                            "picture":{
                                "type":"object",
                                "properties":{
                                    "primary":{"type":"string"},
                                    "primary_secure":{"type":"string"},
                                    "small":{"type":"string"},
                                    "small_secure":{"type":"string"},
                                    "large":{"type":"string"},
                                    "large_secure":{"type":"string"}
                                }
                            },
                            "video":{"type":"string"}
                        }
                    },
                    "price":{
                        "type":"object",
                        "properties":{
                            "actual_paid": {"type":["number","string"]},
                            "sale_price": {"type" : ["number","string"]},
                            "retail_price": {"type" : ["number","string"]},
                            "description" : { "type" : "string"},
                            "currency":{"type":"string"}
                        }
                    }
                }
            }
        }
    }
});

/**
*
*  Base64 encode / decode
*  http://www.webtoolkit.info/javascript-base64.html
*
**/
define('lib/Base64',[], function() {

    var Base64 = {

        // private property
        _keyStr : "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",

        // public method for encoding
        encode : function (input) {
            var output = "";
            var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
            var i = 0;

            input = Base64._utf8_encode(input);

            while (i < input.length) {

                chr1 = input.charCodeAt(i++);
                chr2 = input.charCodeAt(i++);
                chr3 = input.charCodeAt(i++);

                enc1 = chr1 >> 2;
                enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
                enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
                enc4 = chr3 & 63;

                if (isNaN(chr2)) {
                    enc3 = enc4 = 64;
                } else if (isNaN(chr3)) {
                    enc4 = 64;
                }

                output = output +
                this._keyStr.charAt(enc1) + this._keyStr.charAt(enc2) +
                this._keyStr.charAt(enc3) + this._keyStr.charAt(enc4);

            }

            return output;
        },

        // public method for decoding
        decode : function (input) {
            var output = "";
            var chr1, chr2, chr3;
            var enc1, enc2, enc3, enc4;
            var i = 0;

            input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");

            while (i < input.length) {

                enc1 = this._keyStr.indexOf(input.charAt(i++));
                enc2 = this._keyStr.indexOf(input.charAt(i++));
                enc3 = this._keyStr.indexOf(input.charAt(i++));
                enc4 = this._keyStr.indexOf(input.charAt(i++));

                chr1 = (enc1 << 2) | (enc2 >> 4);
                chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
                chr3 = ((enc3 & 3) << 6) | enc4;

                output = output + String.fromCharCode(chr1);

                if (enc3 != 64) {
                    output = output + String.fromCharCode(chr2);
                }
                if (enc4 != 64) {
                    output = output + String.fromCharCode(chr3);
                }

            }

            output = Base64._utf8_decode(output);

            return output;

        },

        // private method for UTF-8 encoding
        _utf8_encode : function (string) {
            string = string.replace(/\r\n/g,"\n");
            var utftext = "";

            for (var n = 0; n < string.length; n++) {

                var c = string.charCodeAt(n);

                if (c < 128) {
                    utftext += String.fromCharCode(c);
                }
                else if((c > 127) && (c < 2048)) {
                    utftext += String.fromCharCode((c >> 6) | 192);
                    utftext += String.fromCharCode((c & 63) | 128);
                }
                else {
                    utftext += String.fromCharCode((c >> 12) | 224);
                    utftext += String.fromCharCode(((c >> 6) & 63) | 128);
                    utftext += String.fromCharCode((c & 63) | 128);
                }

            }

            return utftext;
        },

        // private method for UTF-8 decoding
        _utf8_decode : function (utftext) {
            var string = "";
            var i = 0;
            var c, c1, c2, c3;
            c = c1 = c2 = 0;

            while ( i < utftext.length ) {

                c = utftext.charCodeAt(i);

                if (c < 128) {
                    string += String.fromCharCode(c);
                    i++;
                }
                else if((c > 191) && (c < 224)) {
                    c2 = utftext.charCodeAt(i+1);
                    string += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
                    i += 2;
                }
                else {
                    c2 = utftext.charCodeAt(i+1);
                    c3 = utftext.charCodeAt(i+2);
                    string += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
                    i += 3;
                }

            }

            return string;
        }

    };

    // todo: use native atob & btoa when available (but strip linebreaks first)
    return Base64;

});

/*global SL: false, requirejs: false*/

define('validator/validator', ['validator/logger', 'validator/schema', 'lib/Base64', 'underscore'], function(logger, schema, Base64, _) {
// Ripping this out of util.js. No reason to include all of jQuery for this one function
// @todo: make use of _().find instead
var indexOf = function(array, searchElement) {
    if (array.indexOf){
        return array.indexOf(searchElement);
    }

    for (var i=0; i < array.length; i++) {
        if (i in array && array[i] === searchElement){
            return i;
        }
    }
    return -1;
};

var sociable_validator = {
    /** Logger **/
    info : logger.info,
    warn : logger.info,
    error : function(msg) {
        logger.info(msg);
        this.errorCount++;
    },

    /** Stores the number of things wrong with the RondavuData passed into the validator **/
    errorCount : 0,

    /** maximum size of the tags array on any mo (primary_mo or one from the mos array) **/
    MAX_NUM_TAGS: 30, // this is duplicated in MoStore.java

    /**
     * Null/undefined checker
     * @param input the object we're checking
     * @return true if object is null or undefined, false otherwise
     *
     */
    isNull : function(input) {
        return typeof input == 'undefined' || input === null;
    },
    /**
     * Array checker
     *
     * @param input the object we're checking
     * @return true if the object is an array, false otherwise
     */
    isArray : function(input) {
        return input instanceof Array;
    },
    /**
     * Boolean checker
     * @param input
     */
    isBoolean : function(input) {
        return typeof input === "boolean";
    },
    /**
     * Removes leading and trailing whitespace from a string
     * @param str
     */
    trim: function(str) {
        return str.replace(/^\s+/, "").replace(/\s+$/, "");
    },
    /**
     * Validate the RondavuData.page object
     * @param page
     * @param hasUser
     */
    validatePage : function (page, hasUser) {
        //no page is also valid
        if(this.isNull(page)) {
            return;
        }
        if(!this.isNull(page.tags)) {
            if (!this.isArray(page.tags)) {
                this.error ("page.tags must be an array");
            }
            if(page.tags.length > 0) {
                for (var i = 0; i < page.tags.length; i++) {
                    if (typeof page.tags[i] != 'string') {
                        this.error("page.tags["+i+"] wasn't a string. page.tags must be an array of strings");
                    }
                }
            }
        }
        if (!this.isNull(page.actions)) {
            if(!this.isNull(page.actions.new_registration)) {
                if(!this.isBoolean(page.actions.new_registration)) {
                    this.error("page.actions.new_registration must be a boolean");
                }
            }
            var purchase = page.actions.purchase;
            if(typeof purchase != 'undefined') {
                this.validatePurchase(purchase,hasUser);
            }
        }

        if(!this.isNull(page.shopping_cart)){
            this.warn("Purchases and RondavuData 1.1 in general aren't supported! Please ask your Account Manager or " +
                "Technical Contact about upgrading to RondavuData 1.2");
        }
    },
    /**
     *
     * @param purchase
     * @param hasUser
     */
    validatePurchase : function(purchase, hasUser) {
        if(!hasUser) {
            this.error("A purchase is detected but a user block isn't present! User information is required when recording a purchase");
        }

        var section = "page.actions.purchase";
        if (this.isNull(purchase.order_id) || this.isNull(purchase.total)|| this.isNull(purchase.items)) {
            this.error(section + " must be fully filled out (have an order id, an order total, and a list of items)");
        }
        if(!this.isNull(purchase.total) && isNaN(purchase.total)) {
            this.error(section + ".order total must be a number or string representation of a number. No currency identifiers allowed");
        }
        if(!this.isNull(purchase.items)) {
            if(!this.isArray(purchase.items)) {
                this.error(section +".items must be an array of objects the user has purchased");
            } else {
                for(var i = 0; i < purchase.items.length; i++) {
                    this.validateBoughtItem(purchase.items[i]);
                }
            }
        }
    },
    /**
     * Validate an item in the items array of RondavuData.page.actions.purchase
     * @param item
     */
    validateBoughtItem : function(item) {
        if(this.isNull(item.id)){
            this.error("ID attribute of {id:String,type:String} must be present for each item in a purchase");
        }
        if(this.isNull(item.price)) {
            this.error("Item price (RondavuData.page.actions.purchase.items[].price) is required for purchased items");
        }

    },
    /**
     * Validate a mo (easy, right?)
     * @param mo
     */
    validateMo : function(mo) {
        //validate id
        if(this.isNull(mo.id) || !this.isArray(mo.id)) {
            this.error("mo.id must be present, and must be an array of {id:String,type:String} objects");
        } else {
            if(typeof mo.id[0].id != "string" || typeof mo.id[0].type != "string") {
                this.error("mo.id[].id and mo.id[].type must be a string");
            }
        }
        //validate name
        if (this.isNull(mo.name) || !this.isArray(mo.name)) {
            this.info("if using full mo: mo.name must be present, and must be an array of {name:String[,language:String,primary:boolean]} objects");
        } else {
            if(typeof mo.name[0].name != "string") {
                this.error("mo.name[0].name must be a string");
            }
            if (this.trim(mo.name[0].name) === "") {
                this.error("mo.name[0].name must not be empty string or only whitespace");
            }
        }
        //validate the urls passed in (our usual culprit actually)
        this.validateMoUrl(mo.url);

        // Validate locations (if they exist)
        var hasValidLocation = false;
        if (!this.isNull(mo.location)) {
            hasValidLocation = this.validateLocation(mo.location);
        }
        if (!this.isNull(mo.locations)) {
            if (!this.isArray(mo.locations)) {
                this.error("Mo Locations must be an array");
            } else {
                for (var i = 0; i < mo.locations.length; i++) {
                    this.validateLocation(mo.locations[i]);
                }
            }
        }

        var timezoneRequired = !(hasValidLocation && this.canDetermineTimezoneFromLocation(mo.location));

        // validate the product date
        if(!this.isNull(mo.product_date)) {
            if(!this.isArray(mo.product_date)) {
                this.error("mo.product_date should be an array");
            } else {
                // todo: make sure this is running through jshint.. and then fix dupe variables
                for(var i2 = 0; i2 < mo.product_date.length; i2++) {
                    this.validateDate(mo.product_date[i2], timezoneRequired);
                }
            }
        }



        // Validate the primary tag
        if(!this.isNull(mo.primary_tag)) {
            if(typeof mo.primary_tag != 'string') {
                this.error("mo.primary_tag must be a string");
            }
        }

        // Validate the tags array
        if(!this.isNull(mo.tags)) {
            if (!this.isArray(mo.tags)) {
                this.error ("mo.tags must be an array");
            }
            if (mo.tags.length > this.MAX_NUM_TAGS) {
                this.error("mo.tags has a maximum length of " + this.MAX_NUM_TAGS);
            }
            if(mo.tags.length > 0) {
                for (var i3 = 0; i3 < mo.tags.length; i3++) {
                    if (typeof mo.tags[i3] != 'string') {
                        this.error("mo.tags["+i3+"] wasn't a string. page.tags must be an array of strings");
                    }
                }
            }
        }
    },
    /**
     *
     * @param url
     */
    validateMoUrl : function (url) {
        if(this.isNull(url)){
            this.error("mo.url must not be null! We at least mo.url.detail");
        } else {
            if (this.isNull(url.detail)) {
                this.info("if using full mo: mo.url.detail must not be null");
            } else {
                if(url.detail.indexOf("http") !== 0) {
                    this.error("mo.url.detail must be a complete URL (e.g: http://www.somewhere.com/absolute/path)");
                }
                if(!this.isNull(url.picture)) {
                    if(!this.isNull(url.picture.primary)) {
                        if(url.picture.primary.indexOf("http") !== 0) {
                            this.error("mo.url.picture.primary must be a complete URL (e.g: http://www.somewhere.com/absolute/path/pic.png)");
                        }
                    }
                    if(!this.isNull(url.picture.primary_secure)) {
                        if(url.picture.primary_secure.indexOf("https") !== 0) {
                            this.error("mo.url.picture.primary_secure must be a complete URL AND in https");
                        }
                    }
                }
            }
        }
    },
    /**
     *
     * @param date
     */
    validateDate : function(date, hasLocation) {
        if(this.isNull(date.start)) {
            this.error("Each event date must have a start time");
        } else {
            this.validateTime(date.start, hasLocation);
        }
        /** end isn't required, but is supported */
        if(!this.isNull(date.end)) {
            this.validateTime(date.end, hasLocation);
        }
    },
    /**
     *
     * @param time
     */
    validateTime : function(time, hasLocation) {
        var fields = ["date", "time"];
        var formats = [
            "YYYY-MM-DD",
            "HH:MM"
        ];
        if (!hasLocation) {
            fields.push("timezone");
            formats.push("IANA: http://en.wikipedia.org/wiki/List_of_IANA_time_zones , although 'local' is also accepted if an address (city,state,country) or GPS coordinates are supplied");
        }
        for(var i = 0; i < fields.length; i++) {
            if(this.isNull(time[fields[i]])) {
                this.error("product_date[].start|end."+fields[i]+" must be a string in the format "+formats[i]);
            }
        }
    },
    /**
     *
     * @param location
     */
    validateLocation : function(location) {
        var valid = true;
        if(this.isNull(location.id)) {
            this.warn("An ID is highly suggested for the locations of events");
        }
        var fields = ["id","language","name","url","address_line1","address_line2","city","state","country","postal_code","latitude","longitude"];
        for(var i = 0; i < fields.length; i++) {
            if(!this.isNull(location[fields[i]])) {
                if(typeof location[fields[i]] != "string") {
                    this.error("Event location property "+fields[i]+ " must be of type string");
                    valid = false;
                }
            }
        }
        return valid;
    },

    /**
     * Our backend can determine event timezones from the location if there is either city/state/country or lon/lat
     * @param location
     */
    canDetermineTimezoneFromLocation: function(location) {
        return (location.city && location.state && location.country) || (location.longitude && location.latitude);
    },

    /**
     * @todo: document
     * @param config
     */
    validateConfig : function(config) {
        if ( this.isNull(config) || this.isNull(config.version) ) {
            this.error("RondavuData.config.version must be present");
        }
        if (isNaN(config.version) || (config.version != "1.2")) {
            this.error("RondavuData.config.version must be a valid, up to date version (1.2)");
        }
    },

    /**
     *
     * @param {object} user
     */
    validateUser : function(user) {
        if(this.isNull(user)){
            return;
        }
        if(this.isNull(user.id)){
            this.error("User should at least have an id if the block is present");
        } else if (!this.isArray(user.id)) {
            this.error("User.id should be an array of {id:String,type:String} objects");
        }
    },
    /**
     * ValidateSchema takes in an input customer page data and a defined json schema. It will then validate the customer page data
     * to ensure it follows the schema. Any errors will be logged to the console.
     * Only keys that exist the the schema are allowed to exist in customer page data.
     * Keys must match the type
     * Supports following keywords in schema:
     * type - type that the object should be. Covers primitive types and array.
     * properties - object of valid properties. anything that does exist here will be logged as an error.
     * items - the object schema for each array item.
     * maxItems - max items for Array
     * required - checks for required keys. Only checks on schema children one level down.
     * @param input - customer page data
     * @param schema - schema defined by sociable labs
     */
    validateSchema: function(input, schema){
        var self = this;

        /**
         * This validates an object. First checking that the type matches. If the type doesn't match, we return, logging
         * the error. We then validate that all keys that are in the customer object exist in the schema. Extraneous keys
         * are logged as errors. Next we recurse through all keys or array items that match the schema, calling this
         * function again. Each time, the path is appended and passed down.
         * @param obj - customer page data object
         * @param schema_obj - corresponding schema page data object
         * @param path -
         */
        function validateObject(obj, schema_obj, path){
            //validate type, if assertTypeMatch fails, return. we dont want to validate obj with invalid type, may cause errors.
            if (!self.assertTypeMatch(obj, schema_obj, path)) {
                return;
            }
            //validate max_items field
            self.assertMaxItemsValid(obj, schema_obj, path);

            //check schema to ensure that all required items exist.
            _(schema_obj.properties).each(function(schema_prop, schema_key) {
                if (schema_obj.properties[schema_key].required) {
                    self.assertRequiredKeyExists((schema_key in obj), schema_key, obj, schema_obj, path);
                }
            });

            //validate that all properties in the obj exists under schema_obj.properties
            if (typeof obj === "object" && schema_obj.type == 'object') {
                _(obj).each(function(val, obj_key) {
                    self.assertKeyExistsInSchema((schema_obj.properties && obj_key in schema_obj.properties), obj_key, obj, schema_obj, path);
                });
            }

            //Recurse through children. Different behavior for array or object.
            if (obj instanceof Array && schema_obj.type == 'array') {
                for (var index = 0; index < obj.length; index++) {
                    validateObject(obj[index], schema_obj.items, path + '[' + index + ']');
                }
            } else if (typeof obj === "object" && schema_obj.type == 'object') {
                _(obj).each(function(obj_prop, obj_key) {
                    if (obj_key in schema_obj.properties) {
                        validateObject(obj[obj_key], schema_obj.properties[obj_key], path + obj_key +'.');
                    }
                });
            }



        }


        validateObject(input, schema, '');
    },

    /**
     * Check the customer page to to verify that thier facebook app id matches ours. This only checks if they defined it in the script tag.
     * It will not catch if they define it another way.
     */
    validateFbAppId: function() {
        var patt = /.*facebook.*appId=(\d+)/;
        SL.push(['_getFbAppId', function(customer_configured_app_id) {
            var script_arr = document.getElementsByTagName('script');
            for (var i = 0; i < script_arr.length; i++) {
                var src = script_arr[i].src;
                if (src && (src.indexOf('facebook') >= 0) && src.indexOf('appId') > 0 ) {
                    var app_id = src.match(patt)[1];
                    if (app_id != customer_configured_app_id) {
                        this.error('Configured App Id: ' + customer_configured_app_id + ' does not match app id found on the page script tag: ' + app_id);
                    }
                }

            }
        }]);


    },
    assertMaxItemsValid: function(obj, schema_obj, path){
        if (schema_obj.maxItems && obj instanceof Array) {
            return this.assert((obj.length <= schema_obj.maxItems),"Max Items (" + schema_obj.maxItems+ ") exceeded for array. \n" + path +"[" + obj.length + "]");
        }
        return true;
    },
    assertRequiredKeyExists: function(exp, schema_key, obj, schema_obj, path){
        return this.assert(exp, "Required Key <" + schema_key + "> missing. \n"+path + obj);
    },
    assertKeyExistsInSchema: function(exp, obj_key, obj, schema_obj, path){
        return this.assert(exp, "Invalid Key in page data. Key: " + obj_key + " does not exist in schema" + ". \n" + path + obj_key);
    },
    assertTypeMatch: function(obj, schema_obj, path){
        if (typeof obj === 'undefined') {
            return false;
        }
        if (schema_obj.type == 'array'){
            return this.assert((obj instanceof Array), "Type Error in page data. Expected type: " + schema_obj.type + ", but got: " + typeof obj + ". \n" + path + obj);
        } else {
            return this.assert((typeof obj === schema_obj.type || indexOf(schema_obj.type, typeof obj) >= 0),"Type Error in page data. Expected type: " + schema_obj.type + ", but got: " + typeof obj + ". \n" + path + obj);
        }
    },
    assert: function(exp, message) {
        if (!exp) {
            this.error(message);
            return false;
        }
        return true;
    },

    /**
     * @todo: document
     * @param {object} input
     */
    validateRondavuData : function (input) {
        this.errorCount=0;
        /** Start checking things **/
        // overall
        if (this.isNull(input)) {
            this.error("RondavuData is undefined! This usually points to a lint error. Please visit http://www.jslint.com for more info");
            return;
        }
        if(typeof input == "string") {
            if(input.length <1) {
                this.error("No one likes a joker. Give me something to work with! (FYI I was passed an empty string)");
                return;
            }
            try {
                if (typeof window.Prototype === 'undefined' || window.Prototype.Version < "1.7") {
                    input = window.JSON.parse(input);
                } else {
                    // 1.6 - use evalJSON
                    input = input.evalJSON();
                }
            } catch (ex) {
                this.error("Exception encountered trying to decode a string RondavuData that was passed in! Make sure all keys have quotes around them");
                return;
            }
        }
        var toCheck = {};

        toCheck.page = input.page;
        toCheck.user = input.user;
        toCheck.primary_mo = input.primary_mo;
        toCheck.mos = input.mos;

        //pick out the signed data if possible
        if(!this.isNull(input.signature)) {
            var fields = ["page", "user", "primary_mo","mos"];
            _(fields).each(function(field, i) {
                this.info("Checking for signed version of "+fields[i]);
                if((!this.isNull(input.signature[fields[i]])  &&  this.isNull(input[fields[i]+"_base64"])) ||
                    (this.isNull(input.signature[fields[i]])  && !this.isNull(input[fields[i]+"_base64"]))) {
                    if(this.isNull(input[fields[i]+"_base64"])){
                        this.error("Page."+fields[i]+" present without payload("+fields[i]+"_base64) or vice versa. Make sure both fields are present");
                    }
                } else if(!this.isNull(input[fields[i]+"_base64"])) {
                    var data = input[fields[i]+"_base64"];
                    if (typeof data == "string") {
                        // https://github.com/chick307/base64codec/issues/2
                        data = data.replace(/[\r\n]/g, "");
                    }
                    var decoded_string = Base64.decode(data);
                    if(decoded_string.length > 0) {
                        try {
                            if (typeof window.Prototype === 'undefined' || window.Prototype.Version < "1.7") {
                                toCheck[fields[i]] = window.JSON.parse(decoded_string);
                            } else {
                                // 1.6 - use evalJSON
                                toCheck[fields[i]] = decoded_string.evalJSON();
                            }
                        } catch(ex) {
                            this.error("There was an exception parsing your Base 64 decoded "+fields[i]+". Please make sure field names are quoted. " + ex);
                        }
                    }
                }
            }, this);
        }

        this.info("Validating Config");
        this.validateConfig(input.config);

        this.info("Validating Page");
        this.validatePage(toCheck.page, !this.isNull(toCheck.user));

        this.info("Validating User");
        this.validateUser(toCheck.user);

        if(this.isNull(toCheck.primary_mo)){
            this.error("primary_mo is a required object");
        } else {
            this.info("Validating Primary mo");
            this.validateMo(toCheck.primary_mo);
        }

        if(!this.isNull(toCheck.mos)){
            this.info("Validating Mos array");
            if (!this.isArray(toCheck.mos)) {
                this.error("Mos array must be an array");
            } else {
                for(var i3 = 0; i3 < toCheck.mos.length; i3++) {
                    this.info("Validating mos array object #"+(i3+1));
                    this.validateMo(toCheck.mos[i3]);
                }
            }
        }

        this.info("Validating Schema");
        this.validateSchema(input, schema);
        this.validateFbAppId();

        if(this.errorCount < 1) {
            this.info("Congratulations. Your RondavuData passes basic sanity checks and should work in loading basic Sociable Labs functionality");
        } else {
            this.warn("There " + (this.errorCount == 1 ? "was 1 error" : "were " + this.errorCount + " errors") + " in your RondavuData");
        }
    }
};
    window.sociable_validator = sociable_validator;

    return sociable_validator;
});

// this makes it actually run
// todo: move this to a new "init.js" file and have it call validator.validateRondavuData() so that we can test the validator without executing it
requirejs(['validator/validator'], function(){});

window.sociable_validator = {loaded: true}; // this is here because requirejs runs things in a setTimeout, but we want to be able to see that this script loaded immediately.
;
define("validator/validator.js", function(){});
}());