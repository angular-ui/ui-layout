'use strict';


describe('Controller: uiLayoutCtrl', function () {
  var scope, $controller, Layout;

  beforeEach(function () {

    module('ui.layout');

    inject(function ($rootScope, _$controller_, _Layout_) {
      scope = $rootScope.$new();
      $controller = _$controller_;
      Layout = _Layout_;
    });
  });

  describe('ctrl functions', function () {
    it('isLayoutElement', function () {
      var uic = $controller('uiLayoutCtrl', {
        $scope: scope,
        $attrs: {},
        $element: angular.element('<div></div>')
      });

      var attrContainer = document.createElement('div');
      attrContainer.setAttribute('ui-layout-container', '');

      var attrSplitbar = document.createElement('div');
      attrSplitbar.setAttribute('ui-splitbar', '');

      var tagContainer = document.createElement('ui-layout-container');

      var notUiEl = document.createElement('div');

      expect(uic.isLayoutElement(attrContainer)).toEqual(true);
      expect(uic.isLayoutElement(attrSplitbar)).toEqual(true);
      expect(uic.isLayoutElement(tagContainer)).toEqual(true);
      expect(uic.isLayoutElement(notUiEl)).toEqual(false);
    });

    it('destroy should call the unsubscribe function returned by Layout.addLayout', function () {
      var unsubscribeLayout = jasmine.createSpy('unsubscribeLayout');

      spyOn(Layout, 'addLayout');
      Layout.addLayout.and.callFake(function(){
        return unsubscribeLayout;
      });

      var uic = $controller('uiLayoutCtrl', {
        $scope: scope,
        $attrs: {},
        $element: angular.element('<div></div>')
      });

      expect(Layout.addLayout).toHaveBeenCalledWith(uic);
      expect(unsubscribeLayout).not.toHaveBeenCalled();

      uic.destroy();

      expect(unsubscribeLayout).toHaveBeenCalled();
    });
  });
});