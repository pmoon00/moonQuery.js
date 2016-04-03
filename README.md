# moonQuery
Currently in ***beta***.

Yes, moonQuery is **lightweight**!  2.54KB minified, 1.05KB minified and gzipped.

JavaScript library to query an array of objects using MongoDB like syntax.  This will currently only work on an array of objects, not literals.

This library **SHOULD NOT** encourage developers to build applications where you don't use a proper query language like SQL to query data and then send to the application.  This should be used where appropriate.

### Where functionality
Main functionality of this library is to query an array of objects with properties.
##### Example
```
var arr = [
    { 
        "make": "BMW", 
        "model": "116i M Sport",
        "year": 2006,
        "engine": {
            "cylinders": 4,
            "fuelType": "Petrol"
        }
    },
    { 
        "make": "Mazda",
        "model": "Atenza",
        "year": 2008,
        "engine": {
            "cylinders": 4,
            "fuelType": "Petrol"
        }
    },
    { 
        "make": "BMW",
        "model": "335i",
        "year": 2013,
        "engine": {
            "cylinders": 6,
            "fuelType": "Petrol"
        }
    }
]
```
Using the example array above,
* to get cars that the make are BMW `arr.where({ "make": "BMW" });`
* to get cars with years between 2005 and 2010 `arr.where({ "year": { "$gt": 2004, "$lt": 2011 } });`
* to get cars with years 2006 or 2008 `arr.where({ "year": [2006, 2008] });`
* to get cars with make "Mazda" and has fuelType "Petrol" `arr.where({ "make": "Mazda", "engine": { "fuelType": "Petrol" } });`

### Select functionality
To remap and/or filter the properties of an object to another name.
##### Example
Using the example array above,
* to filter and rename make "make" property to "brand" `arr.select({ "make": "brand" });` will return `[ { "brand": "BMW" }, { "brand": "Mazda" }, { "brand": "BMW" } ]`
* to filter and rename make "make" property to "brand" `arr.select({ "make": "brand", "model": true });` will return `[ { "brand": "BMW", "model": "116i M Sport" }, { "brand": "Mazda", "model": "Atenza" }, { "brand": "BMW", "model": "335i" } ]`

### Sum functionality
To sum properties.  Currently cannot sum properties that are not in the 1st level (*coming soon*).
##### Example
Using the example array above,
* to sum up the year `arr.sum({ "year": true });` returns `6027`
### Performance Logging
To turn on performance logging set `Array.prototype.moonQuerySetting.performanceLogging = true`.  This will show console logs of how long it takes to run the functions in moonQuery.
