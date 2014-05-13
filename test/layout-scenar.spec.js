'use strict';

/* global browserTrigger */

splitMoveTests('touch', 'touchstart', 'touchmove', 'touchend');
splitMoveTests('mouse', 'mousedown', 'mousemove', 'mouseup');

// Wrapper to abstract over using touch events or mouse events.
function splitMoveTests(description, startEvent, moveEvent, endEvent) {
  return describe('Directive: uiLayout with ' + description + ' events', function () {
    var element, scope, compile,
      validTemplate = '<div ui-layout><header></header><footer></footer></div>';

    function createDirective(data, template) {
      var elm;

//    scope.data = data || defaultData;

      elm = angular.element(template || validTemplate);
      angular.element(document.body).prepend(elm);
      compile(elm)(scope);
      scope.$digest();

      return elm;
    }

    beforeEach(function () {

      module('ui.layout');

      inject(function ($rootScope, $compile) {
        scope = $rootScope.$new();
        compile = $compile;
      });
    });

    afterEach(function () {
      if (element) element.remove();
    });

    describe('require', function () {
      it('requestAnimationFrame', function () {
        expect(window.requestAnimationFrame).toBeDefined();
      });
      it('cancelAnimationFrame', function () {
        expect(window.cancelAnimationFrame).toBeDefined();
      });
    });

    // Spy on the requestAnimationFrame to directly trigger it
    beforeEach(function () {
      spyOn(window, 'requestAnimationFrame').and.callFake(function (fct) {
        fct();
      });
    });

    afterEach(function () {
      if (element) element.remove();
    });

    describe('the slider', function () {

      var element_bb, $splitbar, splitbar_bb, splitbarLeftPos;

      beforeEach(function () {
        element =   createDirective();

        element_bb = element[0].getBoundingClientRect();
        $splitbar = _jQuery(element[0]).find('.ui-splitbar');
        splitbar_bb = $splitbar[0].getBoundingClientRect();

        splitbarLeftPos = Math.ceil(splitbar_bb.left);
      });

      it('should do nothing when clicking on it', function () {

        // Click on the splitbar left
        browserTrigger($splitbar, startEvent, { x: splitbarLeftPos });
        browserTrigger($splitbar, endEvent);
        splitbar_bb = $splitbar[0].getBoundingClientRect();

        expect(window.requestAnimationFrame).not.toHaveBeenCalled();
        expect(Math.ceil(splitbar_bb.left)).toEqual(splitbarLeftPos);

      });


      it('should do nothing when moving around it', function () {

        // Click on the splitbar left
        browserTrigger($splitbar, moveEvent, { x: splitbarLeftPos });
        browserTrigger($splitbar, moveEvent, { x: element_bb.height / 4 });
        splitbar_bb = $splitbar[0].getBoundingClientRect();

        expect(window.requestAnimationFrame).not.toHaveBeenCalled();
        expect(Math.ceil(splitbar_bb.left)).toEqual(splitbarLeftPos);

      });

      it('should follow the ' + description, function () {
        browserTrigger($splitbar, startEvent, { y: splitbarLeftPos });

        browserTrigger($splitbar, moveEvent, { y: element_bb.height / 4});
        expect(window.requestAnimationFrame).toHaveBeenCalled();

        splitbar_bb = $splitbar[0].getBoundingClientRect();
        expect(Math.ceil(parseFloat($splitbar[0].style.top))).toEqual(25);

        browserTrigger(document.body, endEvent);
      });

      it('should not follow the ' + description + ' before ' + startEvent, function () {
        expect(Math.ceil(parseFloat($splitbar[0].style.top))).toEqual(50); // Obvious...

        // Move without clicking on it
        browserTrigger($splitbar, moveEvent, { y: Math.random() * element_bb.width });
        browserTrigger($splitbar, endEvent);
        expect(window.requestAnimationFrame).not.toHaveBeenCalled();

        expect(Math.ceil(parseFloat($splitbar[0].style.top))).toEqual(50);
      });

      it('should not follow the ' + description + ' after ' + startEvent, function () {
        browserTrigger($splitbar, startEvent, { y: splitbarLeftPos });
        browserTrigger($splitbar, moveEvent, { y: element_bb.height / 4});
        browserTrigger($splitbar, endEvent);
        expect(window.requestAnimationFrame).toHaveBeenCalled();

        // Move after the end event
        browserTrigger($splitbar, moveEvent, { y: Math.random() * element_bb.width });
        browserTrigger($splitbar, endEvent);

        expect(window.requestAnimationFrame.calls.count()).toEqual(1);
        expect(Math.ceil(parseFloat($splitbar[0].style.top))).toEqual(25);
      });
    });

  });
}
