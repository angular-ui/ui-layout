'use strict';


describe('Controller: uiLayoutCtrl', function () {
  var scope, $controller;
  beforeEach(function () {

    module('ui.layout');

    inject(function ($rootScope, _$controller_) {
      scope = $rootScope.$new();
      $controller = _$controller_;
    });
  });
});