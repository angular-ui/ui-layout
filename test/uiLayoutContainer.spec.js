'use strict';


describe('Directive: uiLayoutContainer', function () {
  var scope, element, $compile,
    template = '' +
    '<div ui-layout="{flow: \'column\'}" ui-layout-loaded>' +
    '  <div ui-layout-container collapsed="layout.beforeContainer" size="100px" min-size="50px"  max-size="200px" resizable="false">One</div>' +
    '  <div ui-layout-container data-collapsed="layout.afterContainer">Two</div>' +
    '</div>';

  function createDirective(layout) {
    var elm;

    scope.layout = layout;
    elm = angular.element(template);
    angular.element(document.body).prepend(elm);
    $compile(elm)(scope);
    scope.$digest();

    return elm;
  }

  beforeEach(function () {

    module('ui.layout');

    inject(function ($rootScope, _$compile_) {
      scope = $rootScope.$new();
      $compile = _$compile_;
    });
  });

  afterEach(function () {
    if (element) element.remove();
  });


  it('should get initial attribute values', function () {
    // this tests values _after_ the layout has been calculated
    element = createDirective({ beforeContainer: true, afterContainer: false});
    var divs = element.find('div'),
      beforeContainer = divs[0],
      afterContainer = divs[2],
      bcScope = angular.element(beforeContainer).isolateScope(),
      acScope = angular.element(afterContainer).isolateScope();

    // you would expect true, but see explanation in uiLayoutLoaded
    expect(bcScope.container.collapsed).toEqual(false);
    expect(bcScope.container.resizable).toEqual(false);
    expect(bcScope.container.size).toEqual(100);
    expect(bcScope.container.uncollapsedSize).toEqual('100px');
    expect(bcScope.container.minSize).toEqual(50);
    expect(bcScope.container.maxSize).toEqual(200);

    expect(acScope.container.collapsed).toEqual(false);
    expect(acScope.container.resizable).toEqual(true);
    // size has been be calculated, this is tested elsewhere
    expect(acScope.container.minSize).toBeNull();
    expect(acScope.container.maxSize).toBeNull();

  });

});