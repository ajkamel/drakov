var fs = require('fs');
var drafter = require('drafter');
var _ = require('lodash');
var urlParser = require('./url');
var parseParameters = require('./parameters');
var parseAction = require('./action');
var autoOptionsAction = require('../json/auto-options-action.json');

module.exports = function(filePath, autoOptions, routeMap) {
    return function(cb) {
        var data = fs.readFileSync(filePath, {encoding: 'utf8'});
        var options = { type: 'ast' };
        drafter.parse(data, options, function(err, result) {
            if (err) {
                console.log(err);
                return cb(err);
            }

            var allRoutesList = [];
            result.ast.resourceGroups.forEach(function(resourceGroup){
                resourceGroup.resources.forEach(setupResourceAndUrl);
            });

            // add OPTIONS route where its missing - this must be done after all routes are parsed
            if (autoOptions) {
                addOptionsRoutesWhereMissing(allRoutesList);
            }

            /**
             * After populating the routeMap that is used to match incoming requests, 
             * check API Blueprint for SERVICE name in the metadata. If one exists, use the value to 
             * namespace the top level keys in routeMap. Note: these keys represent a url path to a resource
             * and are compared against the path of incoming request object  in the route-handler middleware. 
             */

            var metadata = {};
            result.ast.metadata.forEach(function(item){
                metadata[item.name] = item.value;
            });
            var service = metadata.SERVICE;
            
            if (service) {
              var urlPaths = Object.keys(routeMap);
              urlPaths.forEach(function(urlPath) {
                var urlPathNamespaced  = '/' + service + urlPath;
                routeMap[urlPathNamespaced] = routeMap[urlPath];
                // Remove old key/value to prevent conflicts
                delete routeMap[urlPath];
              });
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
        });
    };
};
