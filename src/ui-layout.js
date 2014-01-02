
'use strict';

/**
 * UI.Layout
 */
angular.module('ui.layout', [])
  .controller('uiLayoutCtrl', ['$scope', '$attrs', '$element', function uiLayoutCtrl($scope, $attrs, $element) {
    // Gives to the children directives the access to the parent layout.
    return {
      opts: angular.extend({}, $scope.$eval($attrs.uiLayout), $scope.$eval($attrs.options)),
      element: $element
    };
  }])

  .directive('uiLayout', ['$parse', function ($parse) {

    var splitBarElem_htmlTemplate = '<div class="stretch ui-splitbar"></div>';

    function convertNumericDataTypesToPencents(numberVairousTypeArray, parentSize){
      var _i, _n;
      var _res = []; _res.length = numberVairousTypeArray.length;
      var _commonSizeIndex = [];
      var _remainingSpace = 100;
      for (_i = 0, _n = numberVairousTypeArray.length; _i < _n; ++_i) {
        var rawSize = numberVairousTypeArray[_i];
        var value = parseInt(rawSize, 10);
        // should only support pixels and pencent data type
        var type = rawSize.match(/\d+\s*(px|%)\s*$/i);
        if (!isNaN(value) && type){
          if (type.length > 1 && 'px' === type[1]){
            value = + (value / parentSize * 100).toFixed(5);
          }
          _res[_i] = value;
          _remainingSpace -= value;
        } else{
          rawSize = 'auto';
        }

        if (/^\s*auto\s*$/.test(rawSize)){
          _commonSizeIndex.push(_i); continue;
        }
      }


      if (_commonSizeIndex.length > 0){
        var _commonSize = _remainingSpace / _commonSizeIndex.length ;
        for (_i = 0, _n = _commonSizeIndex.length; _i < _n; ++_i) {
          var cid = _commonSizeIndex[_i];
          _res[cid] = _commonSize;
        }
      }

      parentSize;

      return _res;
    }

    return {
      restrict: 'AE',
      compile: function compile(tElement, tAttrs) {

        var _i, _childens = tElement.children(), _child_len = _childens.length;
        var _sizes, _position;

        // Parse `ui-layout` or `options` attributes (with no scope...)
        var opts = angular.extend({}, $parse(tAttrs.uiLayout)(), $parse(tAttrs.options)());
        var isUsingColumnFlow = opts.flow === 'column';

        tElement
          // Force the layout to fill the parent space
          // fix no height layout...
          .addClass('stretch')
          // set the layout css class
          .addClass('ui-layout-' + (opts.flow || 'row'));

        // Initial global size definition
        opts.sizes = opts.sizes || [];
        // Preallocate the array size
        opts.sizes.length = _child_len;

        for (_i = 0; _i < _child_len; ++_i) {
          // Stretch all the children by default
          angular.element(_childens[_i]).addClass('stretch');
          // Size initialization priority
          // - the size attr on the child element
          // - the global size on the layout option
          // - 'auto' Fair separation of the remaining space
          opts.sizes[_i] = angular.element(_childens[_i]).attr('size') || opts.sizes[_i]  || 'auto';
        }

        // get the final percent sizes
        _sizes = convertNumericDataTypesToPencents(opts.sizes, tElement[0]['offset' + (isUsingColumnFlow ? 'Width' : 'Height')]);

        if (_child_len > 1) {
          // Initialise the layout with equal sizes.

          var flowProperty = ( isUsingColumnFlow ? 'left' : 'top');
          var oppositeFlowProperty = ( isUsingColumnFlow ? 'right' : 'bottom');
          _position = 0;
          for (_i = 0; _i < _child_len; ++_i) {
            var area = angular.element(_childens[_i])
              .css(flowProperty, _position + '%');

            _position += _sizes[_i];
            area.css(oppositeFlowProperty, (100 - _position) + '%');

            if (_i < _child_len - 1) {
              // Add a split bar
              var bar = angular.element(splitBarElem_htmlTemplate).css(flowProperty, _position + '%');
              area.after(bar);
            }
          }
        }
      },
      controller: 'uiLayoutCtrl'
    };

  }])


  .directive('uiSplitbar', function () {

    // Get all the page.
    var htmlElement = angular.element(document.body.parentElement);

    return {
      require: '^uiLayout',
      restrict: 'EAC',
      link: function (scope, iElement, iAttrs, parentLayout) {

        var animationFrameRequested, lastX;
        var _cache = {};

        // Use relative mouse position
        var isUsingColumnFlow = parentLayout.opts.flow === 'column';
        var mouseProperty = ( isUsingColumnFlow ? 'clientX' : 'clientY');

        // Use bounding box / css property names
        var flowProperty = ( isUsingColumnFlow ? 'left' : 'top');
        var oppositeFlowProperty = ( isUsingColumnFlow ? 'right' : 'bottom');
        var sizeProperty = ( isUsingColumnFlow ? 'width' : 'height');

        // Use bounding box properties
        var barElm = iElement[0];


        // Stores the layout values for some seconds to not recalculate it during the animation
        function _cached_layout_values() {
          // layout bounding box
          var layout_bb = parentLayout.element[0].getBoundingClientRect();

          // split bar bounding box
          var bar_bb = barElm.getBoundingClientRect();

          _cache.time = +new Date();
          _cache.barSize = bar_bb[sizeProperty];
          _cache.layoutSize = layout_bb[sizeProperty];
          _cache.layoutOrigine = layout_bb[flowProperty];
        }

        function _draw() {
          var the_pos = (lastX - _cache.layoutOrigine) / _cache.layoutSize * 100;

          // Keep the bar in the window (no left/top 100%)
          the_pos = Math.min(the_pos, 100 - _cache.barSize / _cache.layoutSize * 100);

          // The the bar in the near beetween the near by area
          the_pos = Math.max(the_pos, parseInt(barElm.previousElementSibling.style[flowProperty], 10));
          if (barElm.nextElementSibling.nextElementSibling) {
            the_pos = Math.min(the_pos, parseInt(barElm.nextElementSibling.nextElementSibling.style[flowProperty], 10));
          }

          // change the position of the bar and the next area
          barElm.style[flowProperty] = barElm.nextElementSibling.style[flowProperty] = the_pos + '%';
          // change the size of the previous area
          barElm.previousElementSibling.style[oppositeFlowProperty] = (100 - the_pos) + '%';

          // Enable a new animation frame
          animationFrameRequested = null;
        }

        function _resize(mouseEvent) {
          // Store the mouse position for later

          // FIX :
          // - with touch events, when using jQuery, the mouseEvent is in fact a jQueryEvent. So we use originalEvent here.
          lastX = mouseEvent[mouseProperty] || mouseEvent.originalEvent[mouseProperty];

          // Cancel previous rAF call
          if (animationFrameRequested) {
            window.cancelAnimationFrame(animationFrameRequested);
          }

          if (!_cache.time || +new Date() > _cache.time + 1000) { // after ~60 frames
            _cached_layout_values();
          }

          // Animate the page outside the event
          animationFrameRequested = window.requestAnimationFrame(_draw);
        }


        // Bind the click on the bar then you can move it all over the page.
        iElement.on('mousedown touchstart', function (e) {
          e.preventDefault();
          e.stopPropagation();
          htmlElement.on('mousemove touchmove', _resize);
          return false;
        });
        htmlElement.on('mouseup touchend', function () {
          htmlElement.off('mousemove touchmove');
        });
      }
    };
  });



/**
 * http://paulirish.com/2011/requestanimationframe-for-smart-animating/
 * http://my.opera.com/emoller/blog/2011/12/20/requestanimationframe-for-smart-er-animating
 *
 * requestAnimationFrame polyfill by Erik Möller. fixes from Paul Irish and Tino Zijdel
 *
 * MIT license
 */
var lastTime = 0;
var vendors = ['ms', 'moz', 'webkit', 'o'];
for (var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
  window.requestAnimationFrame = window[vendors[x] + 'RequestAnimationFrame'];
  window.cancelAnimationFrame =
    window[vendors[x] + 'CancelAnimationFrame'] || window[vendors[x] + 'CancelRequestAnimationFrame'];
}

if (!window.requestAnimationFrame) {
  window.requestAnimationFrame = function (callback) {
    var currTime = new Date().getTime();
    var timeToCall = Math.max(0, 16 - (currTime - lastTime));
    var id = window.setTimeout(function () {
        callback(currTime + timeToCall);
      },
      timeToCall);
    lastTime = currTime + timeToCall;
    return id;
  };
}

if (!window.cancelAnimationFrame) {
  window.cancelAnimationFrame = function (id) {
    clearTimeout(id);
  };
}
