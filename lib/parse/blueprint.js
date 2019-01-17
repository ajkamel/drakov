var fs = require('fs');
var drafter = require('drafter');
var _ = require('lodash');
var urlParser = require('./url');
var parseParameters = require('./parameters');
var parseAction = require('./action');
var autoOptionsAction = require('../json/auto-options-action.json');

module.exports = function(filePath, autoOptions, basePathKey, routeMap) {
    return function(cb) {
        var data = fs.readFileSync(filePath, {encoding: 'utf8'});
        var options = { type: 'ast' };
        var basePath;

        drafter.parse(data, options, function(err, result) {
            if (err) {
                console.log(err);
                return cb(err);
            }

            if (basePathKey) {
                 basePath = getBasePath(result, basePathKey);
                 routeMap._basePath = basePath;
            }

            var allRoutesList = [];
            result.ast.resourceGroups.forEach(function(resourceGroup){
                resourceGroup.resources.forEach(setupResourceAndUrl);
            });

            // add OPTIONS route where its missing - this must be done after all routes are parsed
            if (autoOptions) {
                addOptionsRoutesWhereMissing(allRoutesList);
            }

            // Append basepath if a key is set in the configuration options and it is found
            if (basePathKey && basePath) {
                updateWithBasePath(basePath, routeMap);
            }

            cb();

            function setupResourceAndUrl(resource) {
                var parsedUrl = urlParser.parse(resource.uriTemplate);
                var key = parsedUrl.url;
                routeMap[key] = routeMap[key] || { urlExpression: key, methods: {} };
                parseParameters(parsedUrl, resource.parameters, routeMap);
                resource.actions.forEach(function(action){
                    var actionUrl = setupActionUrl(action, parsedUrl, routeMap);
                    parseAction(actionUrl, action, routeMap);
                    saveRouteToTheList(actionUrl, action);
                });
            }

            function setupActionUrl(action, resourceUrl, routeMap) {
              if (action.attributes.uriTemplate !== '') {
                var actionUrl = urlParser.parse(action.attributes.uriTemplate);
                var actionKey = actionUrl.url;
                routeMap[actionKey] = routeMap[actionKey] || { urlExpression: actionKey, methods: {} };
                return actionUrl;
              }
              return resourceUrl;
            }

            /**
             * Adds route and its action to the allRoutesList. It appends the action when route already exists in the list.
             * @param resource Route URI
             * @param action HTTP action
             */
            function saveRouteToTheList(parsedUrl, action) {
                // used to add options routes later
                if (typeof allRoutesList[parsedUrl.url] === 'undefined') {
                    allRoutesList[parsedUrl.url] = [];
                }
                allRoutesList[parsedUrl.url].push(action);
            }

            function addOptionsRoutesWhereMissing(allRoutes) {
                var routesWithoutOptions = [];
                // extracts only routes without OPTIONS
                _.forIn(allRoutes, function (actions, route) {
                    var containsOptions = _.reduce(actions, function (previousResult, iteratedAction) {
                        return previousResult || (iteratedAction.method === 'OPTIONS');
                    }, false);
                    if (!containsOptions) {
                        routesWithoutOptions.push(route);
                    }
                });

                _.forEach(routesWithoutOptions, function (uriTemplate) {
                    // adds prepared OPTIONS action for route
                    var parsedUrl = urlParser.parse(uriTemplate);
                    parseAction(parsedUrl, autoOptionsAction, routeMap);
                });
            }
            function updateWithBasePath(basePath, routeMap) {
                if (basePath !== '') {
                    var urlPaths = Object.keys(routeMap);
                    urlPaths.forEach(function (urlPath) {
                        var urlPathNamespaced = basePath + urlPath;
                        routeMap[urlPathNamespaced] = routeMap[urlPath];
                        // Remove old key/value to prevent conflicts
                        delete routeMap[urlPath];
                    });
                }
            }
            
            function getBasePath(result, basePathKey) {
                return result.ast.metadata.reduce(function (acc, item) {
                    if (item.name.toLowerCase() === basePathKey.toLowerCase()) {
                        return '/' + item.value.replace(/^\/|\/$/g, '');
                    }
                    return acc;
                }, '');
            }
        });
    };
};
