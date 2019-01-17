var glob = require('glob');
var async = require('async');
var parseBlueprint = require('../parse/blueprint');
var endpointSorter = require('./endpoint-sorter');

module.exports = function(options, cb) {
    var sourceFiles = options.sourceFiles;
    var autoOptions = options.autoOptions;
    var basePathKey = options.basePathKey || false;
    var routeMaps = [];

    glob(sourceFiles, {} , function (err, files) {
        if (err) {
            console.error('Failed to parse contracts path.', err);
            return cb(err);
        }

        var asyncFunctions = [];

        files.forEach(function(filePath) {
            // Process each file separately to preserve service namespace 
            var routeMap = {};
            routeMaps.push(routeMap);
            asyncFunctions.push(parseBlueprint(filePath, autoOptions, basePathKey, routeMap));
        });

        async.series(asyncFunctions, function(err) {
            var routeMapCombined = routeMaps.reduce(function(routeMap, next) {
                return Object.assign(routeMap, next);
            }, {});
            cb(err, endpointSorter.sort(routeMapCombined));
        });
    });
};
