(function () {
    "use strict";
    var SETTINGS = {
        "performanceLogging": false
    };
	
    /* WHERE */
	function where(cond) {
		if (!cond || typeof(cond) !== "object") {
			consoleWarn("No valid conditions");
			return this;
		}
		
		var result = [];
		
		for (var i = 0, l = this.length; i < l; i++) {
			var x = this[i];
			
			if (!x || typeof (x) !== "object") {
				continue;				
			}
			
			var r = applyCond(x, cond);
			
			if (r) {
				result.push(x);
			}
		}
		
		return result;
	}
	
	function applyCond(x, cond) {
		var failedCondition = false;
		
		for (var key in cond) {
			var condValue = cond[key];
			var condValueType = condValue && condValue.constructor ? condValue.constructor.name : null;
			var xValue = x[key];
			
			switch (condValueType) {
				case "Object":
					failedCondition = !applyCondObj(xValue, condValue);
					break;
                case "Array":
                    failedCondition = !applyCondArray(xValue, condValue);
					break;
                case "RegExp":
                    failedCondition = !applyCondRegExp(xValue, condValue);
                    break;
				default:
					failedCondition = !(xValue == condValue);
					break;
			}
			
			if (failedCondition) {
				break;
			}
		}
		
		return !failedCondition;
	}
	
	function applyCondArray(x, cond) {
		var condTrue = false;
		
		for (var i = 0, l = cond.length; i < l; i++) {
			var v = cond[i];
            var vType = v.constructor.name;
			
            if ((vType == "RegExp" && applyCondRegExp(x, v)) ||
                (x && vType == "Object" && applyCond(x, v)) ||
                v == x) {
				condTrue = true;
				break;
			}
		}
		
		return condTrue;
	}
	
	function applyCondObj(x, cond) {
		var gtValue = cond.$gt;
		var ltValue = cond.$lt;
        var gtValueValid = !isNullOrUndefined(gtValue);
        var ltValueValid = !isNullOrUndefined(ltValue);
		var condTrue = false;
				
		if (gtValueValid && ltValueValid) {
			condTrue = x > gtValue && x < ltValue;
		} else if (gtValueValid && !ltValueValid) {
			condTrue = x > gtValue;
		} else if (ltValueValid && !gtValueValid) {
			condTrue = x < ltValue;
		} else if (!ltValueValid && !gtValueValid && x) {
            condTrue = applyCond(x, cond);
        }
		
		return condTrue;
	}
	
	function applyCondRegExp(x, cond) {
		return cond.test(x);
	}
    
    /* SELECT */
    function select(mapping) {
        if (!mapping || typeof(mapping) !== "object") {
			consoleWarn("No valid mapping");
			return this;
		}
        
        var result = [];
        
        for (var i = 0, l = this.length; i < l; i++) {
			var x = this[i];
			var newObj = {};
            
			if (!x || typeof (x) !== "object") {
				continue;				
			}
			
			for (var key in mapping) {
                var map = mapping[key];
                var newKey = map === true ? key : map;
                
                newObj[newKey] = x[key];
            }
            
            result.push(newObj);
		}
        
        return result.length == 1 ? result[0] : result;
    }
    
    /* SUM */
    function sum(columns) {
        if (!columns || typeof(columns) !== "object") {
			consoleWarn("No valid columns");
			return this;
		}
        
        var result = {};
        var resultKeys = null;
        
        for (var i = 0, l = this.length; i < l; i++) {
			var x = this[i];
            
			if (!x || typeof (x) !== "object") {
				continue;				
			}
			
			for (var key in columns) {
                result[key] = result[key] > 0 ? result[key] + parseFloat(x[key]) : parseFloat(x[key]);
            }
		}
        
        resultKeys = Object.keys(result);
        
        return resultKeys.length > 1 ? result : result[resultKeys[0]];
    }
	
    /* UTILITY */
    function performanceLoggingWrapper(that, args, fn, fnName) {
        if (SETTINGS.performanceLogging) {
            var startTime = new Date().getTime();    
        }
        
        var results = fn.apply(that, args);
        
        if (SETTINGS.performanceLogging) {
            var duration = new Date().getTime() - startTime;
            consoleLog("Took " + duration + "ms to execute " + fnName, "Performance Logging");
        }
        
        return results;
    }
    
	function consoleWarn(warnMsg, fnName) {
        if (console && console.warn) {
            console.warn("moonQuery%s: %s", fnName ? "[" + fnName + "]" : "", warnMsg);
        } else if (console && console.log) {
            console.log("moonQuery%s: %s", fnName ? "[" + fnName + "]" : "", warnMsg);  
        }
	}
    
	function consoleLog(msg, fnName) {
        if (console && console.log) {
            console.log("moonQuery%s: %s", fnName ? "[" + fnName + "]" : "", msg);  
        }
	}
	
	function isNullOrUndefined(v) {
		return v === null || v === undefined;
	}
    
    function objectKeysPolyfill() {
        // From https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/keys
        if (!Object.keys) {
        Object.keys = (function() {
            "use strict";
            var hasOwnProperty = Object.prototype.hasOwnProperty,
                hasDontEnumBug = !({ toString: null }).propertyIsEnumerable("toString"),
                dontEnums = [
                "toString",
                "toLocaleString",
                "valueOf",
                "hasOwnProperty",
                "isPrototypeOf",
                "propertyIsEnumerable",
                "constructor"
                ],
                dontEnumsLength = dontEnums.length;

            return function(obj) {
            if (typeof obj !== "object" && (typeof obj !== "function" || obj === null)) {
                throw new TypeError("Object.keys called on non-object");
            }

            var result = [], prop, i;

            for (prop in obj) {
                if (hasOwnProperty.call(obj, prop)) {
                result.push(prop);
                }
            }

            if (hasDontEnumBug) {
                for (i = 0; i < dontEnumsLength; i++) {
                if (hasOwnProperty.call(obj, dontEnums[i])) {
                    result.push(dontEnums[i]);
                }
                }
            }
            return result;
            };
        }());
        }
    }
    
    /* RUN CODE */
    objectKeysPolyfill();
	Array.prototype.where = function () { 
        return performanceLoggingWrapper(this, arguments, where, "where");
    };
	Array.prototype.select = function () { 
        return performanceLoggingWrapper(this, arguments, select, "select");
    };
	Array.prototype.sum = function () { 
        return performanceLoggingWrapper(this, arguments, sum, "sum");
    };
    Array.prototype.moonQuerySettings = SETTINGS;
})();
