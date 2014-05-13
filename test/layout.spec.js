'use strict';

describe('Directive: uiLayout', function () {
  var element, scope, compile,
    validTemplate = '<div ui-layout></div>';

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

  describe('when created', function () {

    it('should have a "stretch" class', function () {
      element = createDirective();
      expect(element).toHaveClass('stretch');
    });

    it('should work as an element', function () {
      element = createDirective(null, '<ui-layout></ui-layout>');
      expect(element).toHaveClass('stretch');
    });

    it('should work as an attribute', function () {
      element = createDirective();
      expect(element).toHaveClass('stretch');
    });

    it('should have a "ui-layout-row" class by default', function () {
      element = createDirective();
      expect(element).toHaveClass('ui-layout-row');
    });

    it('should not add split bar when empty', function () {
      element = createDirective();
      expect(element.children().length).toEqual(0);
    });

    it('should add n-1 split bar pour n area', function () {
      var children, splitBarElm;

      // Try with 2 elements
      element = createDirective(null, '<div ui-layout><article></article><section></section></div>');
      children = element.children();
      expect(children.length).toEqual(2 + 1); // add one slide
      expect(children[0].tagName).toEqual('ARTICLE');

      splitBarElm = children.eq(1);
      expect(splitBarElm[0].tagName).toEqual('DIV');
      expect(splitBarElm).toHaveClass('ui-splitbar');

      expect(children[2].tagName).toEqual('SECTION');

      // Try with 4 elements
      element.remove();
      element = createDirective(null, '<div ui-layout><header></header><article></article><section></section><footer></footer></div>');
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

  });

  describe('when using size option', function () {

    var $header, $footer;

    function createSizedDirective(notation) {
      element = createDirective(null, '<div ui-layout><header size="' + notation + '"></header><footer></footer></div>');

      $header = element.children().eq(0)[0];
      $footer = element.children().eq(2)[0];

      return element;
    }

    function testSizeNotation(notation, middlePosition) {
      element = createSizedDirective(notation);
      expect($header.style.top).toEqual('0%');
      expect($header.style.bottom).toEqual((100 - middlePosition || 50) + '%');
      expect($footer.style.top).toEqual((middlePosition || 50) + '%');
      expect($footer.style.bottom).toEqual('0%');
      element.remove();
    }

    describe('when using dummy input', function () {
      var wtfSizes = ['fuu', '  ', 'wtf10', '10wtf', '12', '12ppx', '12px%', '12px %'];
      for (var _i = 0, n = wtfSizes.length; _i < n; ++_i) {
        (function (notation) { // Use a new scope
          it('should handle "' + notation + '" as auto', function () {
            testSizeNotation(notation);
          });
        })(wtfSizes[_i]);
      }
    });

    it('should support percent type', function () {
      testSizeNotation('10%', 10);
    });

    it('should support pixel type', function () {
      var pixelPosition = 10;
      element = createSizedDirective(pixelPosition + 'px');

      var expectedMiddle = +(pixelPosition / _jQuery(element[0]).height() * 100).toFixed(5);

      expect(parseFloat($header.style.top)).toEqual(0);
      expect(parseFloat($header.style.bottom)).toBeCloseTo(100 - expectedMiddle);

      expect(parseFloat($footer.style.top)).toBeCloseTo(expectedMiddle);
      expect($footer.style.bottom).toEqual('0%');

      element.remove();
    });

    it('should handle useless spaces', function () {
      testSizeNotation('    10%', 10);
      testSizeNotation('10%    ', 10);
      testSizeNotation('  10%  ', 10);
      testSizeNotation(' 10  % ', 10);
    });

  });

  describe('when using column flow', function () {

    var $header, $sidebar, $footer;

    describe('when created', function () {
      beforeEach(function () {
        element = createDirective(null, '<div ui-layout="{ flow : \'column\' }"><header></header><footer></footer></div>');

        $header = element.children().eq(0)[0];
        $sidebar = element.children().eq(1)[0];
        $footer = element.children().eq(2)[0];
      });

      it('should have a "ui-layout-column" class', function () {
        expect(element).toHaveClass('ui-layout-column');
      });

      it('should initialise with equal width', function () {
        expect($header.style.left).toEqual('0%');
        expect($header.style.right).toEqual('50%');
        expect($footer.style.left).toEqual('50%');
        expect($footer.style.right).toEqual('0%');
      });

      it('should have a split bar at the middle', function () {
        expect($sidebar.style.left).toEqual('50%');
      });
    });

    it('should initialise a sidebar at 10%', function () {
      element = createDirective(null, '<div ui-layout="{ flow : \'column\' }"><header size="10%"></header><footer></footer></div>');
      $sidebar = element.children().eq(1)[0];
      expect($sidebar.style.left).toEqual('10%');
    });
  });

  describe('in row flow', function () {

    var $header, $sidebar, $footer;

    describe('when created', function () {
      beforeEach(function () {

        element = createDirective(null, '<div ui-layout><header></header><footer></footer></div>');

        $header = element.children().eq(0)[0];
        $sidebar = element.children().eq(1)[0];
        $footer = element.children().eq(1)[0];

      });

      it('should have a "ui-layout-row" class by default', function () {
        expect(element).toHaveClass('ui-layout-row');
      });

      it('should initialise with equal height', function () {
        var firstElemHeight = element.children()[0].getBoundingClientRect().height;
        for (var i = 0; i < element.children().length; i += 2) {
          expect(element.children()[i].getBoundingClientRect().height, 'tagName').toEqual(firstElemHeight);
        }
      });

      it('should have a split bar at the middle', function () {
        expect($sidebar.style.top).toEqual('50%');
      });
    });

    it('should initialise a sidebar at 10%', function () {
      element = createDirective(null, '<div ui-layout><header size="10%"></header><footer></footer></div>');
      $sidebar = element.children().eq(1)[0];
      expect($sidebar.style.top).toEqual('10%');
    });
  });


  describe('controller', function () {
    var ctrl;

    beforeEach(inject(function (_$controller_) {
      element = createDirective();
      ctrl = _$controller_('uiLayoutCtrl', { $scope: scope, $element: element, $attrs: element[0].attributes });
    }));

    it('should expose the options and the element', function () {
      expect(ctrl).toEqual({ opts: jasmine.any(Object), element: element });
    });
  });

});
