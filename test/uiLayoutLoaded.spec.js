'use strict';


describe('Directive: uiLayoutLoaded', function () {
  var scope, element, $compile, $timeout,
    template = '<div ui-layout ui-layout-loaded><header ui-layout-container></header><footer ui-layout-container></footer></div>';

  function compileDirective(before, after, tpl) {
    var elm;

    elm = angular.element(tpl || template);
    angular.element(document.body).prepend(elm);
    $compile(elm)(scope);
    scope.$digest();

    return elm;
  }

  beforeEach(function () {

    module('ui.layout');

    inject(function ($rootScope, _$compile_, _$timeout_) {
      scope = $rootScope.$new();
      $compile = _$compile_;
      $timeout = _$timeout_;
    });
  });

  afterEach(function () {
    if (element) element.remove();
  });

  it('should broadcast ui.layout.loaded and return attribute value', function () {
    spyOn(scope, '$broadcast');
    compileDirective(false, false, '<div ui-layout id="elID" ui-layout-loaded="attrValue"></div>');
    expect(scope.$broadcast).toHaveBeenCalledWith('ui.layout.loaded','attrValue');
  });

  it('should broadcast ui.layout.loaded and return null', function () {
    spyOn(scope, '$broadcast');
    compileDirective(false, false, '<div ui-layout id="elID" ui-layout-loaded></div>');
    $timeout.flush();
    expect(scope.$broadcast).toHaveBeenCalledWith('ui.layout.loaded',null);
  });

  it('should broadcast ui.layout.loaded after all ui.layout directives have been loaded and return attribute value not an evaluated expression', function () {
    spyOn(scope, '$broadcast');
    scope.data = {
      someMessage: "dummy"
    };

    var elm = angular.element('<div ui-layout  id="elID" ui-layout-loaded="data.someMessage"></div>');
    angular.element(document.body).prepend(elm);
    $compile(elm)(scope);
    scope.$digest();
    expect(scope.$broadcast).toHaveBeenCalledWith('ui.layout.loaded','data.someMessage');
  });

});