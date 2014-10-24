'use strict';

/* global browserTrigger */

splitMoveTests('touch', 'touchstart', 'touchmove', 'touchend');
splitMoveTests('mouse', 'mousedown', 'mousemove', 'mouseup');

// Wrapper to abstract over using touch events or mouse events.
function splitMoveTests(description, startEvent, moveEvent, endEvent) {
  return describe('Directive: uiLayout with ' + description + ' events', function () {
    var element, scope, compile,
      validTemplate = '<div ui-layout><header ui-layout-container></header><footer ui-layout-container></footer></div>',
      defaultDividerSize = 10;

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
        element = createDirective();

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

        var expextedPos = Math.floor(element_bb.height / 4);
        expect(Math.ceil(parseFloat($splitbar[0].style.top))).toEqual(expextedPos);

        browserTrigger(document.body, endEvent);
      });

      it('should not follow the ' + description + ' before ' + startEvent, function () {
        var expectedPos = Math.floor((element_bb.height - defaultDividerSize) / 2);
        expect(Math.ceil(parseFloat($splitbar[0].style.top))).toEqual(expectedPos); // Obvious...

        // Move without clicking on it
        browserTrigger($splitbar, moveEvent, { y: Math.random() * element_bb.width });
        browserTrigger($splitbar, endEvent);
        expect(window.requestAnimationFrame).not.toHaveBeenCalled();

        expect(Math.ceil(parseFloat($splitbar[0].style.top))).toEqual(expectedPos);
      });

      it('should not follow the ' + description + ' after ' + startEvent, function () {
        browserTrigger($splitbar, startEvent, { y: splitbarLeftPos });
        browserTrigger($splitbar, moveEvent, { y: element_bb.height / 4});
        browserTrigger($splitbar, endEvent);
        expect(window.requestAnimationFrame).toHaveBeenCalled();

        // Move after the end event
        browserTrigger($splitbar, moveEvent, { y: Math.random() * element_bb.width });
        browserTrigger($splitbar, endEvent);

        var expectedPos = Math.floor(element_bb.height / 4);
        expect(window.requestAnimationFrame.calls.count()).toEqual(1);
        expect(Math.ceil(parseFloat($splitbar[0].style.top))).toEqual(expectedPos);
      });

      describe('collapse buttons', function() {
        var toggleBeforeButton, toggleAfterButton;

        beforeEach(function() {
          toggleBeforeButton = $splitbar.children()[0];
          toggleAfterButton = $splitbar.children()[1];
        });

        it('should exist', function() {
          expect(toggleBeforeButton).toBeDefined();
          expect(toggleAfterButton).toBeDefined();
        });

        it('should toggle before', function() {
          var expectedSize = Math.floor((element_bb.height - defaultDividerSize) / 2);
          var $header = element.children().eq(0)[0];

          expect(parseInt($splitbar[0].style.top)).toEqual(expectedSize);
          expect($header.getBoundingClientRect().height).toEqual(expectedSize);

          browserTrigger(toggleBeforeButton, 'click');

          expect(parseInt($splitbar[0].style.top)).toEqual(0);
          expect($header.getBoundingClientRect().height).toEqual(0);
          expect(toggleAfterButton.style.display).toBe('none');

          browserTrigger(toggleBeforeButton, 'click');

          expect(parseInt($splitbar[0].style.top)).toEqual(expectedSize);
          expect($header.getBoundingClientRect().height).toEqual(expectedSize);
          expect(toggleAfterButton.style.display).toBe('inline');
        });

        it('should toggle after', function() {
          var expectedSize = Math.floor((element_bb.height - defaultDividerSize) / 2);
          var $footer = element.children().eq(2)[0];

          expect(parseInt($splitbar[0].style.top)).toEqual(expectedSize);
          expect($footer.getBoundingClientRect().height).toEqual(expectedSize);

          browserTrigger(toggleAfterButton, 'click');

          expect(parseInt($splitbar[0].style.top)).toEqual(element_bb.height - defaultDividerSize);
          expect($footer.getBoundingClientRect().height).toEqual(0);
          expect(toggleBeforeButton.style.display).toBe('none');

          browserTrigger(toggleAfterButton, 'click');

          expect(parseInt($splitbar[0].style.top)).toEqual(expectedSize);
          expect($footer.getBoundingClientRect().height).toEqual(expectedSize);
          expect(toggleBeforeButton.style.display).toBe('inline');
        });
      });
    });

  });
}
