/**
 * @ngdoc object
 * @name  Bastion.content-hosts.controller:ContentHostHostCollectionsController
 *
 * @requires $scope
 * @requires $q
 * @requires $location
 * @requires translate
 * @requires ContentHost
 * @requires Nutupane
 *
 * @description
 *   Provides the functionality for the list host collections details action pane.
 */
angular.module('Bastion.content-hosts').controller('ContentHostHostCollectionsController',
    ['$scope', '$q', '$location', 'translate', 'ContentHost', 'Nutupane',
    function ($scope, $q, $location, translate, ContentHost, Nutupane) {
        var hostCollectionsPane, params;

        $scope.successMessages = [];
        $scope.errorMessages = [];

        params = {
            'id': $scope.$stateParams.contentHostId,
            'search': $location.search().search || "",
            'sort_by': 'name',
            'sort_order': 'ASC',
            'paged': true
        };

        hostCollectionsPane = new Nutupane(ContentHost, params, 'hostCollections');
        $scope.hostCollectionsTable = hostCollectionsPane.table;

        $scope.removeHostCollections = function (contentHost) {
            var deferred = $q.defer(),
                success,
                error,
                hostCollections,
                hostCollectionsToRemove;

            success = function (data) {
                $scope.successMessages = [translate('Removed %x host collections from content host "%y".')
                    .replace('%x', $scope.hostCollectionsTable.numSelected).replace('%y', $scope.contentHost.name)];
                $scope.hostCollectionsTable.working = false;
                $scope.hostCollectionsTable.selectAll(false);
                hostCollectionsPane.refresh();
                $scope.contentHost.$get();
                deferred.resolve(data);
            };

            error = function (response) {
                deferred.reject(response.data.errors);
                $scope.errorMessages = response.data.errors;
                $scope.hostCollectionsTable.working = false;
            };

            $scope.hostCollectionsTable.working = true;

            hostCollections = _.pluck($scope.contentHost.hostCollections, 'id');
            hostCollectionsToRemove = _.pluck($scope.hostCollectionsTable.getSelected(), 'id');
            contentHost["host_collection_ids"] = _.difference(hostCollections, hostCollectionsToRemove);

            contentHost.$update({id: $scope.contentHost.uuid}, success, error);
            return deferred.promise;
        };
    }]
);
