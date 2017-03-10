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
    
    describe('getMousePosition', function(){
      
      var controller;

      beforeEach(function(){
        controller = $controller('uiLayoutCtrl', {
          $scope: scope,
          $attrs: {},
          $element: angular.element('<div></div>')});
      });
      
      it('should handle standard mouse event', function(){
        var mockMouseEvent = {};
        mockMouseEvent[controller.sizeProperties.mouseProperty] = 0;
        
        var result = controller.getMousePosition(mockMouseEvent);
        
        expect(result).toEqual(0);
      });
      
      it('should handle jQuery mouse event', function(){
        
        var mockMouseEvent = {
          originalEvent: {}
        };
        mockMouseEvent.originalEvent[controller.sizeProperties.mouseProperty] = 0;
        
        var result = controller.getMousePosition(mockMouseEvent);

        expect(result).toEqual(0);
      });
      
      it('should handle standard touch event', function(){
        
        var mockMouseEvent = {
          targetTouches: []
        };
        mockMouseEvent.targetTouches[0] = {};
        mockMouseEvent.targetTouches[0][controller.sizeProperties.mouseProperty] = 0;
        
        var result = controller.getMousePosition(mockMouseEvent);
 
        expect(result).toEqual(0);
      });
      
      it('should handle unrecognised standard event', function(){
        var mockMouseEvent = {};
        
        var result = controller.getMousePosition(mockMouseEvent);
        
        expect(result).toEqual(null);
      });
      
      it('should handle jQuery touch event', function(){
        
        var mockMouseEvent = {
          originalEvent: {
            targetTouches: []
          }
        };
        
        mockMouseEvent.originalEvent.targetTouches[0] = {};
        mockMouseEvent.originalEvent.targetTouches[0][controller.sizeProperties.mouseProperty] = 0;
        
        var result = controller.getMousePosition(mockMouseEvent);

        expect(result).toEqual(0);
      });
      
      it('should handle unrecognised jQuery event', function(){

        var mockMouseEvent = {
          originalEvent: {}
        };
        
        var result = controller.getMousePosition(mockMouseEvent);

        expect(result).toEqual(null);
      });
    });
  });
});