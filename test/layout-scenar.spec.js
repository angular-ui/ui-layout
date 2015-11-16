'use strict';

/* global browserTrigger */

splitMoveTests('touch', 'touchstart', 'touchmove', 'touchend');
splitMoveTests('mouse', 'mousedown', 'mousemove', 'mouseup');

// Wrapper to abstract over using touch events or mouse events.
function splitMoveTests(description, startEvent, moveEvent, endEvent) {
  return describe('Directive: uiLayout with ' + description + ' events', function () {
    var element, scope, compile, $timeout,
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

      inject(function ($rootScope, $compile, _$timeout_) {
        scope = $rootScope.$new();
        compile = $compile;
        $timeout = _$timeout_;
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
        expect(Math.ceil(parseFloat($splitbar[0].style.top))).toEqual(expectedPos);

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
          var expectedAutosized = Math.floor((element_bb.height - defaultDividerSize) / 2);

          var $header = element.children().eq(0)[0];

          expect(parseInt($splitbar[0].style.top)).toEqual(expectedAutosized);
          expect($header.getBoundingClientRect().height).toEqual(expectedAutosized);

          browserTrigger(toggleBeforeButton, 'click');

          expect(parseInt($splitbar[0].style.top)).toEqual(0);
          expect($header.getBoundingClientRect().height).toEqual(0);
          expect(toggleAfterButton.style.display).toBe('none');

          browserTrigger(toggleBeforeButton, 'click');

          expect(parseInt($splitbar[0].style.top)).toEqual(expectedAutosized);
          expect($header.getBoundingClientRect().height).toEqual(expectedAutosized);
          expect(toggleAfterButton.style.display).toBe('inline');
        });

        it('should toggle after', function() {

          var roundedHalf = Math.floor((element_bb.height - defaultDividerSize) / 2),
            expectedAutosized = roundedHalf,
            expectedLastAutosized = roundedHalf;

          // add remainder to the last element when parent size is odd
          if (element_bb.height % 2 === 1) {
            expectedLastAutosized += 1;
          }
          var $footer = element.children().eq(2)[0];
          expect(parseInt($splitbar[0].style.top)).toEqual(expectedAutosized);
          expect($footer.getBoundingClientRect().height).toEqual(expectedLastAutosized);

          browserTrigger(toggleAfterButton, 'click');
          expect(parseInt($splitbar[0].style.top)).toEqual(element_bb.height - defaultDividerSize);
          expect($footer.getBoundingClientRect().height).toEqual(0);
          expect(toggleBeforeButton.style.display).toBe('none');

          browserTrigger(toggleAfterButton, 'click');
          expect(parseInt($splitbar[0].style.top)).toEqual(expectedAutosized);
          expect($footer.getBoundingClientRect().height).toEqual(expectedLastAutosized);
          expect(toggleBeforeButton.style.display).toBe('inline');
        });
      });
    });

  });
}

describe('toggle programmatically', function() {
  var scope, $controller, $compile, $timeout;
  beforeEach(function () {

    module('ui.layout');

    inject(function ($rootScope, _$controller_, _$compile_, _$timeout_) {
      scope = $rootScope.$new();
      $controller = _$controller_;
      $compile = _$compile_;
      $timeout = _$timeout_;
    });
  });

  function compileDirective(before, after, tpl) {
    var template = tpl || '' +
      '<div ui-layout="{flow: \'column\'}" ui-layout-loaded>' +
      '  <div ui-layout-container data-collapsed="layout.beforeContainer" size="100px">One</div>' +
      '  <div ui-layout-container data-collapsed="layout.afterContainer" size="200px">Two</div>' +
      '</div>';

    scope.layout = {
      beforeContainer: before,
      afterContainer: after
    };

    var elm = angular.element(template);
    angular.element(document.body).prepend(elm);
    $compile(elm)(scope);
    scope.$digest();

    return elm;
  }


  it('should reset container to uncollapsed state when loaded', function() {
    //@see explanation for uiLayoutLoaded
    var elm = compileDirective(true, true);

    var divs = elm.find('div'),
      beforeContainer = divs[0],
      afterContainer = divs[2];
    expect(beforeContainer.style.width).toEqual('100px');
    expect(afterContainer.style.width).toEqual('200px');
  });

  it('should collapse and uncollapse beforeContainer', function() {
    var elm = compileDirective(false, false);

    var divs = elm.find('div'),
      beforeContainer = divs[0],
      afterContainer = divs[2];
    expect(beforeContainer.style.width).toEqual('100px');
    expect(afterContainer.style.width).toEqual('200px');

    scope.layout.beforeContainer = true;
    scope.$apply();
    $timeout.flush();

    expect(beforeContainer.style.width).toEqual('0px');

    scope.layout.beforeContainer = false;
    scope.$apply();
    $timeout.flush();

    expect(beforeContainer.style.width).toEqual('100px');
  });

  it('should collapse and uncollapse afterContainer', function() {
    var elm = compileDirective(false, false);

    var divs = elm.find('div'),
      beforeContainer = divs[0],
      afterContainer = divs[2];
    expect(beforeContainer.style.width).toEqual('100px');
    expect(afterContainer.style.width).toEqual('200px');

    scope.layout.afterContainer = true;
    scope.$apply();
    $timeout.flush();

    expect(afterContainer.style.width).toEqual('0px');

    scope.layout.afterContainer = false;
    scope.$apply();
    $timeout.flush();

    expect(afterContainer.style.width).toEqual('200px');
  });
});
