'use strict';

/* Controllers */

angular.module('mmsApp')
.controller('MainCtrl', ['$scope', '$timeout', '$location', '$rootScope', '$state', '_', '$window', '$uibModal', 'growl', '$http', 'URLService', 'hotkeys', 'growlMessages', 'StompService', 'UtilsService', 'HttpService', 'AuthService', '$interval',
function($scope, $timeout, $location, $rootScope, $state, _, $window, $uibModal, growl, $http, URLService, hotkeys, growlMessages, StompService, UtilsService, HttpService, AuthService, $interval) {
    $rootScope.ve_viewContentLoading = false;
    $rootScope.ve_treeInitial = '';
    $rootScope.ve_title = '';
    $rootScope.ve_footer = '';

    var modalOpen = false;
    var host = $location.host();
    if (host.indexOf('europaems') !== -1 || host.indexOf('arrmems') !== -1 || host.indexOf('msmems') !== -1) {
        $rootScope.ve_footer = 'The technical data in this document is controlled under the U.S. Export Regulations, release to foreign persons may require an export authorization.';
    }
    if (host.indexOf('fn') !== -1)
        $rootScope.ve_footer = 'JPL/Caltech PROPRIETARY — Not for Public Release or Redistribution. No export controlled documents allowed on this server.';

    $window.addEventListener('beforeunload', function(event) {
        if ($rootScope.ve_edits && !_.isEmpty($rootScope.ve_edits)) {
            var message = 'You may have unsaved changes, are you sure you want to leave?';
            event.returnValue = message;
            return message;
        }
    });

    hotkeys.bindTo($scope)
        .add({
            combo: 'alt+m',
            description: 'close all messages',
            callback: function() {growlMessages.destroyAllMessages();}
        }).add({
            combo: 'ctrl+`',
            description: 'fast cf in editor',
            callback: function() {}
        });

    $scope.$on('$stateChangeError', function(event, toState, toParams, fromState, fromParams, error) {
        $rootScope.ve_stateChanging = false;
        $rootScope.ve_viewContentLoading = false;
        //check if error is ticket error
        if (!error || error.status === 401 || 
                (error.status === 404 && error.config && error.config.url && 
                error.config.url.indexOf('/login/ticket') !== -1)) { //check if 404 if checking valid ticket
            event.preventDefault();
            $rootScope.ve_redirect = {toState: toState, toParams: toParams};
            $state.go('login', {notify: false});
            return;
        }
        growl.error('Error: ' + error.message);
    });

    $rootScope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams){ 
        $rootScope.ve_viewContentLoading = true;
        HttpService.transformQueue();
        $rootScope.ve_stateChanging = true;
    });

    $rootScope.$on("mms.unauthorized", function(event, response) {
        // add a boolean to the 'or' statement to check for modal window
        if ($state.$current.name === 'login' || $rootScope.ve_stateChanging || modalOpen)
            return;
        AuthService.checkLogin().then(function(){}, function() {
            if ($state.$current.name === 'login' || modalOpen)
                return;
            modalOpen = true;
            var instance = $uibModal.open({
                template: '<div class="modal-header">You have been logged out, please login again.</div><div class="modal-body"><form name="loginForm" ng-submit="login(credentials)">' + 
                                '<input type="text" class="form-control login-icons" ng-model="credentials.username" placeholder="&#xf007; Username" style="margin-bottom: 1.5em;" autofocus>' + 
                                '<input type="password" class="form-control login-icons" ng-model="credentials.password" placeholder="&#xf084; Password" style="margin-bottom: 1.5em;">' + 
                                '<button class="btn btn-block" type="submit" style="background: #2f889a; color:white;">LOG IN <span ng-if="spin" ><i class="fa fa-spin fa-spinner"></i>' + 
                            '</span></button></form></div>',
                scope: $scope,
                backdrop: 'static',
                controller: ['$scope', '$uibModalInstance', function ($scope, $uibModalInstance) {
                    $scope.credentials = {
                        username: '',
                        password: ''
                    };
                    $scope.spin = false;
                    $scope.login = function (credentials) {
                        $scope.spin = true;
                        var credentialsJSON = {"username":credentials.username, "password":credentials.password};
                            AuthService.getAuthorized(credentialsJSON).then(function (user) {
                                growl.success("Logged in");
                                $uibModalInstance.dismiss();
                            }, function (reason) {
                                $scope.spin = false;
                                growl.error(reason.message);
                            });
                        };
                    }],
                size: 'md'
            }).result.finally(function(){
                modalOpen = false;
            });
        });
    });
    // broadcast mms.unauthorized every minute with interval service
    $interval(function() {
        $rootScope.$broadcast("mms.unauthorized");
    }, 60000, 0, false);

    $rootScope.$on('$stateChangeSuccess', 
        function(event, toState, toParams, fromState, fromParams) {
            $rootScope.ve_stateChanging = false;
            $rootScope.hidePanes = false;
            $rootScope.showManageRefs = false;
            $rootScope.showLogin = false;
            if ($state.current.name === 'login' || $state.current.name === 'login.select') {
                $rootScope.hidePanes = true;
                $rootScope.showLogin = true;
            } else if ( $state.includes('project') && !($state.includes('project.ref')) ) {
                $rootScope.hidePanes = true;
                $rootScope.showManageRefs = true;
                $rootScope.$broadcast('fromParamChange', fromParams);
            }
            if ($state.current.name === 'project.ref') {
                $rootScope.ve_treeInitial = toParams.refId;
            } else if ($state.current.name === 'project.ref.preview') {
                var index = toParams.documentId.indexOf('_cover');
                if (index > 0)
                    $rootScope.ve_treeInitial = toParams.documentId.substring(5, index);
                else
                    $rootScope.ve_treeInitial = toParams.documentId;
            } else if ($state.includes('project.ref.document') && ($state.current.name !== 'project.ref.document.order')) {
                if (toParams.viewId !== undefined)
                    $rootScope.ve_treeInitial = toParams.viewId;
                else
                    $rootScope.ve_treeInitial = toParams.documentId;
            }
            $rootScope.ve_viewContentLoading = false;
            if ($state.includes('project.ref') && (fromState.name === 'login' || fromState.name === 'login.select' || fromState.name === 'project')) {
                $timeout(function() {
                    $rootScope.ve_tree_pane.toggle();
                    $rootScope.ve_tree_pane.toggle();
                }, 0, false);
            }
        }
    );

    var workingModalOpen = false;
    $rootScope.$on('mms.working', function(event, response) {
        $rootScope.ve_viewContentLoading = false;
        if (workingModalOpen) {
            return;
        }
        $scope.mmsWorkingTime = response.data;
        workingModalOpen = true;
        var instance = $uibModal.open({
            template: "<div class=\"modal-header\">Please come back later</div><div class=\"modal-body\">The document you're requesting has been requested already at {{mmsWorkingTime.startTime | date:'M/d/yy h:mm a'}} and is currently being cached, please try again later.</div>",
            scope: $scope,
            backdrop: true,
            controller: ['$scope', '$uibModalInstance', function ($scope, $uibModalInstance) {
                }],
            size: 'md'
        }).result.finally(function(){
            workingModalOpen = false;
        });
    });
}]);
