'use strict';


describe('Directive: uiLayout', function () {
  var element, scope, compile,
      validTemplate = '<div ui-layout></div>',
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

  beforeEach(function() {
    jasmine.addMatchers({
      toBeAbout: function() {
        return {
          compare: function(actual, expected, precision) {
            precision = parseInt(precision)|| 1;
            actual = parseInt(actual);
            expected = parseInt(expected);

            return {
              pass: Math.abs(actual - expected) <= precision
            };
          }
        };
      }
    });
  });

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
      element = createDirective(null, '<div ui-layout><article ui-layout-container></article><section ui-layout-container></section></div>');
      children = element.children();
      expect(children.length).toEqual(2 + 1); // add one slide
      expect(children[0].tagName).toEqual('ARTICLE');

      splitBarElm = children.eq(1);
      expect(splitBarElm[0].tagName).toEqual('DIV');
      expect(splitBarElm).toHaveClass('ui-splitbar');

      expect(children[2].tagName).toEqual('SECTION');

      // Try with 4 elements
      element.remove();
      var dirHtml = '<div ui-layout><header ui-layout-container></header><article ui-layout-container></article><section ui-layout-container></section><footer ui-layout-container></footer></div>';
      element = createDirective(null, dirHtml);
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
    var layoutBounds, headerBounds;

    function createSizedDirective(notation) {
      element = createDirective(null, '<div ui-layout><header ui-layout-container size="' + notation + '"></header><footer ui-layout-container></footer></div>');

      $header = element.children().eq(0)[0];
      $footer = element.children().eq(2)[0];

      return element;
    }

    function createDataSizedDirective(notation) {
      element = createDirective(null, '<div ui-layout><header ui-layout-container data-size="' + notation + '"></header><footer ui-layout-container></footer></div>');

      $header = element.children().eq(0)[0];
      $footer = element.children().eq(2)[0];

      return element;
    }


    function testSizeNotation(notation, actualSize) {
      element = createSizedDirective(notation);
      test(element, notation, actualSize);
      element.remove();

      element = createDataSizedDirective(notation);
      test(element, notation, actualSize);
      element.remove();
    }

    function test(element, notation, actualSize) {
      layoutBounds = element[0].getBoundingClientRect();
      headerBounds = $header.getBoundingClientRect();

      expect(parseFloat($header.style.top)).toEqual(0);

      if(notation.indexOf('%') >= 0 && actualSize != null && !isNaN(actualSize)) {
        expect(parseFloat($header.style.height)).toBeAbout(layoutBounds.height * (actualSize / 100));
        expect(parseFloat($footer.style.height)).toBeAbout(layoutBounds.height - headerBounds.height - defaultDividerSize);
        expect(parseFloat($footer.style.top)).toEqual((headerBounds.height + defaultDividerSize));
      } else if(notation.indexOf('px') && actualSize != null && !isNaN(actualSize)) {
        expect(parseFloat($header.style.height)).toEqual(actualSize);
        expect(parseFloat($footer.style.height)).toEqual(layoutBounds.height - actualSize - defaultDividerSize);
        expect(parseFloat($footer.style.top)).toEqual(actualSize + defaultDividerSize);
      }

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
      testSizeNotation('10px', 10);
    });

    it('should handle useless spaces', function () {
      testSizeNotation('    10%', 10);
      testSizeNotation('10%    ', 10);
      testSizeNotation('  10%  ', 10);
      testSizeNotation(' 10  % ', 10);
    });
  });

  describe('when using the min-size option', function() {
    var $header, $footer;
    var layoutBounds, headerBounds;

    function createSizedDirective(notation) {
      element = createDirective(null, '<div ui-layout><header ui-layout-container size="1px" min-size="' + notation + '"></header><footer ui-layout-container></footer></div>');

      $header = element.children().eq(0)[0];
      $footer = element.children().eq(2)[0];

      return element;
    }

    function createDataSizedDirective(notation) {
      element = createDirective(null, '<div ui-layout><header ui-layout-container size="1px" data-min-size="' + notation + '"></header><footer ui-layout-container></footer></div>');

      $header = element.children().eq(0)[0];
      $footer = element.children().eq(2)[0];

      return element;
    }

    function testSizeNotation(notation, minSize) {
      element = createSizedDirective(notation);
      test(element, notation, minSize);
      element.remove();

      element = createDataSizedDirective(notation);
      test(element, notation, minSize);
      element.remove();

    }

    function test(element, notation, minSize) {
      layoutBounds = element[0].getBoundingClientRect();
      headerBounds = $header.getBoundingClientRect();

      expect(parseFloat($header.style.top)).toEqual(0);

      if(notation.indexOf('%') >= 0 && minSize != null && !isNaN(minSize)) {
        expect(parseFloat($header.style.height)).toBeAbout(layoutBounds.height * (minSize / 100));
        expect(parseFloat($footer.style.height)).toBeAbout(layoutBounds.height - headerBounds.height - defaultDividerSize);
        expect(parseFloat($footer.style.top)).toEqual((headerBounds.height + defaultDividerSize));
      } else if(notation.indexOf('px') && minSize != null && !isNaN(minSize)) {
        expect(parseFloat($header.style.height)).toEqual(minSize);
        expect(parseFloat($footer.style.height)).toEqual(layoutBounds.height - minSize - defaultDividerSize);
        expect(parseFloat($footer.style.top)).toEqual(minSize + defaultDividerSize);
      }
    }

    it('should support percent type', function () {
      testSizeNotation('10%', 10);
    });

    it('should support pixel type', function () {
      testSizeNotation('10px', 10);
    });

    it('should handle useless spaces', function () {
      testSizeNotation('    10%', 10);
      testSizeNotation('10%    ', 10);
      testSizeNotation('  10%  ', 10);
      testSizeNotation(' 10  % ', 10);
    });
  });

  describe('when using the max-size option', function() {
    var $header, $footer;
    var layoutBounds, headerBounds;

    function createSizedDirective(notation) {
      element = createDirective(null, '<div ui-layout><header ui-layout-container size="100%" max-size="' + notation + '"></header><footer ui-layout-container></footer></div>');

      $header = element.children().eq(0)[0];
      $footer = element.children().eq(2)[0];

      return element;
    }

    function createDataSizedDirective(notation) {
      element = createDirective(null, '<div ui-layout><header ui-layout-container size="100%" data-max-size="' + notation + '"></header><footer ui-layout-container></footer></div>');

      $header = element.children().eq(0)[0];
      $footer = element.children().eq(2)[0];

      return element;
    }

    function testSizeNotation(notation, maxSize) {
      element = createSizedDirective(notation);
      test(element, notation, maxSize);
      element.remove();

      element = createDataSizedDirective(notation);
      test(element, notation, maxSize);
      element.remove();
    }

    function test(element, notation, maxSize) {
      layoutBounds = element[0].getBoundingClientRect();
      headerBounds = $header.getBoundingClientRect();

      expect(parseFloat($header.style.top)).toEqual(0);

      if(notation.indexOf('%') >= 0 && maxSize != null && !isNaN(maxSize)) {
        expect(parseFloat($header.style.height)).toBeAbout(layoutBounds.height * (maxSize / 100));
        expect(parseFloat($footer.style.height)).toBeAbout(layoutBounds.height - headerBounds.height - defaultDividerSize);
        expect(parseFloat($footer.style.top)).toEqual((headerBounds.height + defaultDividerSize));
      } else if(notation.indexOf('px') && maxSize != null && !isNaN(maxSize)) {
        expect(parseFloat($header.style.height)).toEqual(maxSize);
        expect(parseFloat($footer.style.height)).toEqual(layoutBounds.height - maxSize - defaultDividerSize);
        expect(parseFloat($footer.style.top)).toEqual(maxSize + defaultDividerSize);
      }

    }

    it('should support percent type', function () {
      testSizeNotation('10%', 10);
    });

    it('should support pixel type', function () {
      testSizeNotation('10px', 10);
    });

    it('should handle useless spaces', function () {
      testSizeNotation('    10%', 10);
      testSizeNotation('10%    ', 10);
      testSizeNotation('  10%  ', 10);
      testSizeNotation(' 10  % ', 10);
    });
  });

  describe('when using the collapse option', function() {

  });

  describe('when using column flow', function () {

    var $header, $sidebar, $footer;
    var layoutBounds, headerBounds;

    describe('when created', function () {
      beforeEach(function () {
        element = createDirective(null, '<div ui-layout="{ flow : \'column\' }"><header ui-layout-container></header><footer ui-layout-container></footer></div>');

        $header = element.children().eq(0)[0];
        $sidebar = element.children().eq(1)[0];
        $footer = element.children().eq(2)[0];

        layoutBounds = element[0].getBoundingClientRect();
        headerBounds = $header.getBoundingClientRect();
      });

      it('should have a "ui-layout-column" class', function () {
        expect(element).toHaveClass('ui-layout-column');
      });

      it('should initialise with equal width', function () {
        var expectedHeaderWidth = Math.floor((layoutBounds.width - defaultDividerSize) / 2),
          expectedFooterWidth = expectedHeaderWidth;

        if (layoutBounds.width % 2 === 1) {
          expectedFooterWidth += 1; // "dangling pixel" added to the last autosized container in a layout
        }


        expect($header.style.left).toEqual('0px');
        expect($header.style.width).toEqual(expectedHeaderWidth + 'px');
        expect($footer.style.left).toEqual((expectedHeaderWidth + defaultDividerSize) + 'px');
        expect($footer.style.width).toEqual(expectedFooterWidth + 'px');
      });

      it('should have a split bar at the middle', function () {
        var middle = Math.floor((layoutBounds.width - defaultDividerSize) / 2);
        expect($sidebar.style.left).toEqual(middle + 'px');
      });
    });

    it('should initialise a sidebar at 10%', function () {
      element = createDirective(null, '<div ui-layout="{ flow : \'column\' }"><header ui-layout-container size="10%"></header><footer ui-layout-container></footer></div>');
      $sidebar = element.children().eq(1)[0];
      var expectedPos = Math.floor(layoutBounds.width * 0.1);
      expect($sidebar.style.left).toBeAbout(expectedPos);
    });
  });

  describe('in row flow', function () {

    var $header, $sidebar, $footer;
    var layoutBounds, headerBounds;

    describe('when created', function () {
      beforeEach(function () {

        element = createDirective(null, '<div ui-layout><header ui-layout-container></header><footer ui-layout-container></footer></div>');

        $header = element.children().eq(0)[0];
        $sidebar = element.children().eq(1)[0];
        $footer = element.children().eq(1)[0];

        layoutBounds = element[0].getBoundingClientRect();
        headerBounds = $header.getBoundingClientRect();

      });

      it('should have a "ui-layout-row" class by default', function () {
        expect(element).toHaveClass('ui-layout-row');
      });

      it('should initialise with equal height when parent container height has an even value', function () {
        var parentHeightEven = element[0].getBoundingClientRect().height % 2 === 0;
        if (parentHeightEven) {
          var firstElemHeight = element.children()[0].getBoundingClientRect().height;
          for (var i = 0; i < element.children().length; i += 2) {
            expect(element.children()[i].getBoundingClientRect().height, 'tagName').toEqual(firstElemHeight);
          }
        }
      });

      it('should initialise with last container height larger by 1px when parent container height has an odd value', function () {
        var parentHeightOdd = element[0].getBoundingClientRect().height % 2 !== 0;
        if (parentHeightOdd) {
          var firstElemHeight = element.children()[0].getBoundingClientRect().height;
          var lastElementHeight = element.children()[2].getBoundingClientRect().height;
          expect(lastElementHeight).toEqual(firstElemHeight + 1);
        }
      });

      it('should have a split bar at the middle', function () {
        // not an absolute middle. In case of odd height, last container is larger by 1px (remainder of the rounding down)
        var expectedMiddle = Math.floor((layoutBounds.height - defaultDividerSize) / 2);
        expect($sidebar.style.top).toEqual(expectedMiddle + 'px');
      });
    });

    it('should initialise a sidebar at 10%', function () {
      element = createDirective(null, '<div ui-layout><header ui-layout-container size="10%"></header><footer ui-layout-container></footer></div>');
      $sidebar = element.children().eq(1)[0];
      var expectedPos = Math.floor(layoutBounds.height * 0.1);
      expect($sidebar.style.top).toBeAbout(expectedPos);
    });
  });
});
