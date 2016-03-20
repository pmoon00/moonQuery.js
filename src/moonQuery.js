(function () {
    "use strict";
	Array.prototype.where = where;
	Array.prototype.select = select;
	
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
			var condValueType = condValue.constructor.name;
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
			
            if ((v.constructor.name == "RegExp" && applyCondRegExp(x, v)) || v == x) {
				condTrue = true;
				break;
			}
		}
		
		return condTrue;
	}
	
	function applyCondObj(x, cond) {
		var gtValue = cond.$gt;
		var ltValue = cond.$lt;
		var condTrue = false;
				
		if (!isNullOrUndefined(gtValue) && !isNullOrUndefined(ltValue)) {
			condTrue = x > gtValue && x < ltValue;
		} else if (!isNullOrUndefined(gtValue) && isNullOrUndefined(ltValue)) {
			condTrue = x > gtValue;
		} else if (!isNullOrUndefined(ltValue) && isNullOrUndefined(gtValue)) {
			condTrue = x < ltValue;
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
	
	function consoleWarn(warnMsg) {
        if (console && console.warn) {
            console.warn("jsQuery: %s", warnMsg);
        } else if (console && console.log) {
            console.log("jsQuery: %s", warnMsg);  
        }
	}
	
	function isNullOrUndefined(v) {
		return v === null || v === undefined;
	}
})();