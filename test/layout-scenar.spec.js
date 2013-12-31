'use strict';

/* global browserTrigger */

splitMoveTests('touch', 'touchstart', 'touchmove', 'touchend');
splitMoveTests('mouse', 'mousedown', 'mousemove', 'mouseup');

// Wrapper to abstract over using touch events or mouse events.
function splitMoveTests(description, startEvent, moveEvent, endEvent) {
  return describe('uiLayout with ' + description + ' events', function () {

    // declare these up here to be global to all tests
    var scope, $compile, element;

    /**
     * UTILS
     */

    function appendTemplate(tpl) {
      element = angular.element(tpl);
      angular.element(document.body).append(element);
      $compile(element)(scope);
      scope.$digest();
    }

    /**
     * TESTS
     */

    beforeEach(module('ui.layout'));

    // inject in angular constructs. Injector knows about leading/trailing underscores and does the right thing
    // otherwise, you would need to inject these into each test
    beforeEach(inject(function (_$rootScope_, _$compile_) {
      scope = _$rootScope_.$new();
      $compile = _$compile_;
    }));


    // jasmine matcher for expecting an element to have a css class
    // https://github.com/angular/angular.js/blob/master/test/matchers.js
    beforeEach(function () {
      this.addMatchers({
        toHaveClass: function (cls) {
          this.message = function () {
            return 'Expected "' + angular.mock.dump(this.actual) + '" to have class "' + cls + '".';
          };

          return this.actual.hasClass(cls);
        }
      });
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
      spyOn(window, 'requestAnimationFrame').andCallFake(function (fct) {
        fct();
      });
    });

    afterEach(function () {
      if (element) element.remove();
    });

    describe('the slider', function () {

      var element_bb, $splitbar, splitbar_bb, splitbar_left_pos;

      beforeEach(function () {
        appendTemplate('<div ui-layout><header></header><footer></footer></div>');

        element_bb = element[0].getBoundingClientRect();
        $splitbar = _jQuery(element[0]).find('.ui-splitbar');
        splitbar_bb = $splitbar[0].getBoundingClientRect();

        splitbar_left_pos = Math.ceil(splitbar_bb.left);
      });

      it('should do nothing when clicking on it', function () {

        // Click on the splitbar left
        browserTrigger($splitbar, startEvent, { x: splitbar_left_pos });
        browserTrigger($splitbar, endEvent);
        splitbar_bb = $splitbar[0].getBoundingClientRect();

        expect(window.requestAnimationFrame).not.toHaveBeenCalled();
        expect(Math.ceil(splitbar_bb.left)).toEqual(splitbar_left_pos);

      });

      it('should follow the ' + description, function () {
        browserTrigger($splitbar, startEvent, { y: splitbar_left_pos });

        browserTrigger($splitbar, moveEvent, { y: element_bb.height / 4});
        expect(window.requestAnimationFrame).toHaveBeenCalled();

        splitbar_bb = $splitbar[0].getBoundingClientRect();
        expect(Math.ceil(parseFloat($splitbar[0].style.top))).toEqual(25);

        browserTrigger(document.body, endEvent);
      });


    });



  });
}
