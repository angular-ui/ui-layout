//
// SPEC HELPERS
//

var matchers = {};

// jasmine matcher for expecting an element to have a css class
// https://github.com/angular/angular.js/blob/master/test/matchers.js
matchers.toHaveClass = function () {
  return {
    compare: function (actual, cls) {

      var result = {};

      result.pass = actual && actual.hasClass(cls);

      if (result.pass) {
        result.message = 'Expected "' + actual[0].outerHTML + '" not to have class "' + cls + '".';
      } else {
        result.message = 'Expected "' + actual[0].outerHTML + '" to have class "' + cls + '".';
      }

      return result;
    }
  };
};


//
// Add it !
//
beforeEach(function () {
  jasmine.addMatchers(matchers);
});
