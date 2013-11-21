describe('uiLayout', function () {
  'use strict';

  // declare these up here to be global to all tests
  var scope, $compile, element;


  function appendTemplate(tpl) {
    element = angular.element(tpl);
    angular.element(document.body).append(element);
    $compile(element)(scope);
    scope.$digest();
  }

  beforeEach(module('ui.layout'));

  // inject in angular constructs. Injector knows about leading/trailing underscores and does the right thing
  // otherwise, you would need to inject these into each test
  beforeEach(inject(function (_$rootScope_, _$compile_, _$controller_) {
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


  describe('directive', function () {

    afterEach(function () {
      if (element) {
        element.remove();
      }
    });

    it('should have a "stretch" class', function () {
      appendTemplate('<div ui-layout></div>');
      expect(element).toHaveClass('stretch');
    });

    it('should work as an element', function () {
      appendTemplate('<ui-layout></ui-layout>');
      expect(element).toHaveClass('stretch');
    });

    it('should work as an attribute', function () {
      appendTemplate('<div ui-layout></div>');
      expect(element).toHaveClass('stretch');
    });

    it('should have a "ui-layout-row" class by default', function () {
      appendTemplate('<div ui-layout></div>');
      expect(element).toHaveClass('ui-layout-row');
    });

    it('should not add split bar when empty', function () {
      appendTemplate('<div ui-layout></div>');
      expect(element.children().length).toEqual(0);
    });

    it('should not add split bar when only one area', function () {
      appendTemplate('<div ui-layout><section></section></div>');
      expect(element.children().length).toEqual(1);
    });

    it('should add n-1 split bar pour n area', function () {
      var children, splitBarElm;

      // Try with 2 elements
      appendTemplate('<div ui-layout><article></article><section></section></div>');
      children = element.children();
      expect(children.length).toEqual(2 + 1); // add one slide
      expect(children[0].tagName).toEqual('ARTICLE');

      splitBarElm = children.eq(1);
      expect(splitBarElm[0].tagName).toEqual('DIV');
      expect(splitBarElm).toHaveClass('ui-splitbar');

      expect(children[2].tagName).toEqual('SECTION');

      // Try with 4 elements
      appendTemplate('<div ui-layout><header></header><article></article><section></section><footer></footer></div>');
      children = element.children();
      expect(children.length).toEqual(4 + 3); // add three slide

      // Raw pluck
      function _pluck(col, prop) {
        var _r = [];
        for (var i = 0; i < col.length; i++) {
          _r[i] = col[i][prop];
        }
        return _r;
      }

      expect(_pluck(children, 'tagName')).toEqual(['HEADER', 'DIV', 'ARTICLE', 'DIV', 'SECTION', 'DIV', 'FOOTER']);

    });

    describe('in column flow', function () {

      beforeEach(function () {
        appendTemplate('<div ui-layout="{ flow : \'column\' }"><header></header><footer></footer></div>');
      });

      it('should have a "ui-layout-column" class by default', function () {
        expect(element).toHaveClass('ui-layout-column');
      });

      it('should initialise with equal width', function () {
        var firstElemWidth = element.children()[0].getBoundingClientRect().width;
        for (var i = 0; i < element.children().length; i++) {
          expect(element.children()[i].getBoundingClientRect().width, 'tagName').toEqual(firstElemWidth);
        }
      });

      it('should have a split bar at the middle', function () {
        expect(element.children().eq(1).css('left')).toEqual('50%');
      });
    });


    describe('in row flow', function () {

      beforeEach(function () {
        appendTemplate('<div ui-layout="{ flow : \'row\' }"><header></header><footer></footer></div>');
      });

      it('should have a "ui-layout-row" class by default', function () {
        expect(element).toHaveClass('ui-layout-row');
      });

      it('should initialise with equal height', function () {
        var firstElemHeight = element.children()[0].getBoundingClientRect().height;
        for (var i = 0; i < element.children().length; i++) {
          expect(element.children()[i].getBoundingClientRect().height, 'tagName').toEqual(firstElemHeight);
        }
      });

      it('should have a split bar at the middle', function () {
        expect(element.children().eq(1).css('top')).toEqual('50%');
      });
    });

  });


  describe('controller', function () {
    var ctrl;

    beforeEach(inject(function (_$controller_) {
      appendTemplate('<div ui-layout="{ flow : \'row\' }"></div>');
      ctrl = _$controller_('uiLayoutCtrl', { $scope: scope, $element: element, $attrs: element[0].attributes });
    }));

    it('should expose the options and the element', function () {
      expect(ctrl).toEqual({ opts: jasmine.any(Object), element: element });
    });
  });

});
