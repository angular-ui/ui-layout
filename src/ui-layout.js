'use strict';

/**
 * UI.Layout
 */
angular.module('ui.layout', [])
  .controller('uiLayoutCtrl', function uiLayoutCtrl($scope, $attrs, $element, LayoutContainer) {
    var containers = [];
    var containerMap = {};
    var ctrl = this;
    var opts = angular.extend({}, $scope.$eval($attrs.uiLayout), $scope.$eval($attrs.options));
    var numOfSplitbars = 0;
    var isUpdating = false;
    var children = $element.children();
    var lastDividerRemoved = false;
    var cache;

    ctrl.movingSplitbar = null;
    ctrl.bounds = $element[0].getBoundingClientRect();
    ctrl.isUsingColumnFlow = opts.flow === 'column';
    ctrl.sizeProperties = !ctrl.isUsingColumnFlow ?
    { sizeProperty: 'height', offsetName: 'offsetHeight', flowProperty: 'top', oppositeFlowProperty: 'bottom', mouseProperty: 'clientY', flowPropertyPosition: 'y' } :
    { sizeProperty: 'width', offsetName: 'offsetWidth', flowProperty: 'left', oppositeFlowProperty: 'right', mouseProperty: 'clientX', flowPropertyPosition: 'x' };

    $element
      // Force the layout to fill the parent space
      // fix no height layout...
      .addClass('stretch')
      // set the layout css class
      .addClass('ui-layout-' + (opts.flow || 'row'));

    // Initial global size definition
    opts.sizes = opts.sizes || [];
    opts.maxSizes = opts.maxSizes || [];
    opts.minSizes = opts.minSizes || [];
    opts.dividerSize = opts.dividerSize || 10; //default divider size set to 10
    ctrl.opts = opts;

    var mouseUpHandler = function(event) {
      if(ctrl.movingSplitbar !== null) {
        ctrl.movingSplitbar = null;
      }
    };
    $element.bind('mouseup', function(event) {
      $scope.$apply(angular.bind(ctrl, mouseUpHandler, event));
    });

    ctrl.processSplitbar = function(container) {
      var beforeIndex, afterIndex;
      var index = containers.indexOf(container);
      var elementSize = $element[0][ctrl.sizeProperties.offsetName];

      var setValues = function(container) {
        var start = container[ctrl.sizeProperties.flowProperty];
        var end = container[ctrl.sizeProperties.flowProperty] + container.size;

        container.beforeMinValue = angular.isNumber(container.minSize) ? start + container.minSize : start;
        container.beforeMaxValue = angular.isNumber(container.maxSize) ? start + container.maxSize : null;

        container.afterMinValue = angular.isNumber(container.minSize) ? end - container.minSize : end;
        container.afterMaxValue = angular.isNumber(container.maxSize) ? end - container.maxSize : null;
      }

      //verify the container was found in the list
      if(index > -1) {
        var isLastSplitbar = index === (containers.length - 2);

        var beforeContainer = (index > 0) ? containers[index-1] : null;
        var afterContainer = ((index+1) <= containers.length) ? containers[index+1] : null;

        if(beforeContainer !== null) setValues(beforeContainer);
        if(afterContainer !== null) setValues(afterContainer);

        return {
          beforeContainer: beforeContainer,
          afterContainer: afterContainer
        }
      }

      return null;
    }

    var mouseMoveHandler = function(event) {
      var length = 0;
      var eventProperty = ctrl.sizeProperties.mouseProperty;
      var position = ctrl.sizeProperties.flowProperty;
      var oppositePosition = ctrl.sizeProperties.oppositeFlowProperty;
      var dividerSize = ctrl.toNumber(opts.dividerSize);
      var elementSize = $element[0][ctrl.sizeProperties.offsetName];
      var availableSize = elementSize - dividerSize;

      if(ctrl.movingSplitbar !== null) {
        var splitbarIndex = containers.indexOf(ctrl.movingSplitbar);
        var nextSplitbarIndex = (splitbarIndex + 2) < containers.length ? splitbarIndex + 2 : null;

        if(splitbarIndex > -1) {
          var processedContainers = ctrl.processSplitbar(containers[splitbarIndex]);
          var beforeContainer = processedContainers.beforeContainer;
          var afterContainer = processedContainers.afterContainer;

          // calculate container positons
          var difference = ctrl.movingSplitbar[position] - event[eventProperty];
          var newPosition = ctrl.movingSplitbar[position] - difference;

          var afterContainerEnd = (nextSplitbarIndex) ? afterContainer[position] : elementSize;

          var afterContainerSize = afterContainerEnd - newPosition;
          // Keep the bar in the window (no left/top 100%)
          newPosition = Math.min(elementSize-dividerSize, newPosition);

          // Keep the bar from going past the previous element min/max values
          if(angular.isNumber(beforeContainer.beforeMinValue) && newPosition < beforeContainer.beforeMinValue) newPosition = beforeContainer.beforeMinValue;
          if(angular.isNumber(beforeContainer.beforeMaxValue) && newPosition > beforeContainer.beforeMaxValue) newPosition = beforeContainer.beforeMaxValue;

          // Keep the bar from going past the next element min/max values
          if(afterContainer !== null && angular.isNumber(afterContainer.afterMinValue) && newPosition > (afterContainer.afterMinValue - dividerSize)) newPosition = afterContainer.afterMinValue - dividerSize;
          if(afterContainer !== null && angular.isNumber(afterContainer.afterMaxValue) && newPosition < afterContainer.afterMaxValue) newPosition = afterContainer.afterMaxValue;

          console.log('---');
          console.log(splitbarIndex, nextSplitbarIndex, containers.length);
          console.log('diff:', difference);
          console.log('beforeContainer:', beforeContainer);
          console.log('afterContainer:', afterContainer);
          console.log('---\n');

          // resize the before container
          beforeContainer.size = newPosition - beforeContainer[position];

          // update after container position
          var oldAfterContainerPosition = afterContainer[position];
          afterContainer[position] = newPosition + dividerSize;

          //update after container size if the position has changed
          if(afterContainer[position] != oldAfterContainerPosition) afterContainer.size = (nextSplitbarIndex !== null) ? (oldAfterContainerPosition + afterContainer.size) - (newPosition + dividerSize) : elementSize - (newPosition + dividerSize);

          // move the splitbar
          ctrl.movingSplitbar[position] = newPosition;
        }
      }
    };
    $element.bind('mousemove', function(event) {
      $scope.$apply(angular.bind(ctrl, mouseMoveHandler, event));
    });

    ctrl.toNumber = function(num) {
      if(num) {
        var n = Number(num);
        if(parseFloat(num) === n) return n;
        return Number(num.replace(/\D+/g, '')) || 0;
      }
      return null;
    };

    ctrl.isPercent = function(num) {
      return (num && angular.isString(num) && num.indexOf('%') > -1) ? true : false;
    };

    ctrl.convertToPixels = function(size, parentSize) {
      return Math.floor(parentSize * (ctrl.toNumber(size) / 100))
    };

    ctrl.updateDisplay = function() {
      var c, i;
      var dividerSize = ctrl.toNumber(opts.dividerSize);
      var elementSize = $element[0][ctrl.sizeProperties.offsetName];
      var availableSize = elementSize - (dividerSize * numOfSplitbars);
      var originalSize = availableSize;
      var usedSpace = 0;
      var numOfAutoContainers = 0;

      // remove the last divider container from DOM
      if(!lastDividerRemoved && containers.length === $element.children().length) {
        var lastContainerIndex = containers.length - 1;
        containers[lastContainerIndex].element.remove();
        containers.splice(lastContainerIndex, 1);
        lastDividerRemoved = true;
        numOfSplitbars--;
      }

      // calculate sizing for containers
      for(i=0; i < containers.length; i++) {
        if(!LayoutContainer.isSplitbar(containers[i])) {
          var child = containers[i].element;
          opts.maxSizes[i] = child.attr('max-size') || opts.maxSizes[i] || null;
          opts.minSizes[i] = child.attr('min-size') || opts.minSizes[i] || null;
          opts.sizes[i] = child.attr('size') || opts.sizes[i] || 'auto';

          //convert percent to pixels
          if(ctrl.isPercent(opts.sizes[i])) opts.sizes[i] = ctrl.convertToPixels(opts.sizes[i], originalSize);
          if(ctrl.isPercent(opts.maxSizes[i])) opts.maxSizes[i] = ctrl.convertToPixels(opts.maxSizes[i], originalSize);
          if(ctrl.isPercent(opts.minSizes[i])) opts.minSizes[i] = ctrl.convertToPixels(opts.minSizes[i], originalSize);

          if(opts.sizes[i] === 'auto') {
            numOfAutoContainers++;
          } else {
            availableSize -= ctrl.toNumber(opts.sizes[i]);
          }
        }
      }

      // set the sizing for the containers
      var autoSize = Math.floor(availableSize / numOfAutoContainers);
      for(i=0; i < containers.length; i++) {
        c = containers[i];
        c[ctrl.sizeProperties.flowProperty] = usedSpace;
        c.maxSize = ctrl.toNumber(opts.maxSizes[i]);
        c.minSize= ctrl.toNumber(opts.minSizes[i]);
        c.size = !LayoutContainer.isSplitbar(c) ? ctrl.toNumber(opts.sizes[i]) || autoSize : dividerSize;
        usedSpace += c.size;
        //        console.log(availableSize, usedSpace, c.size, numOfAutoContainers, containers.length, containers);
      }
    };

    ctrl.addContainer = function(container) {
      containers.push(container);

      if(LayoutContainer.isSplitbar(container)) {
        numOfSplitbars++;
      }

      ctrl.updateDisplay();
    };

    $scope.updateDisplay = function() {
      console.log(containers);
      //      ctrl.updateDisplay();
    };

  })

  .directive('uiLayout', function() {
    return {
      restrict: 'AE',
      controller: 'uiLayoutCtrl',
      link: function(scope, element, attrs, ctrl) {
        scope.$watch(element[0][ctrl.sizeProperties.offsetName], function() {
          ctrl.updateDisplay();
        });
      }
    };
  })

  .directive('uiSplitbar', function(LayoutContainer) {
    // Get all the page.
    var htmlElement = angular.element(document.body.parentElement);

    return {
      restrict: 'EAC',
      require: '^uiLayout',
      scope: {},
      link: function(scope, element, attrs, ctrl) {
        if(!element.hasClass('stretch')) element.addClass('stretch');
        if(!element.hasClass('ui-splitbar')) element.addClass('ui-splitbar');

        scope.splitbar = LayoutContainer.Splitbar();
        scope.splitbar.element = element;

        var mouseDownHandler = function(event) {
          console.debug('mouseDown:', event);
          scope.splitbar.initialPosition = {};
          scope.splitbar.initialPosition.x = event.clientX;
          scope.splitbar.initialPosition.y = event.clientY;
          ctrl.movingSplitbar = scope.splitbar;

          ctrl.processSplitbar(scope.splitbar);

          event.preventDefault();
          event.stopPropagation();
        };

        element.bind('mousedown', angular.bind(scope.splitbar, mouseDownHandler));

        scope.$watch('splitbar.size', function(newValue, oldValue) {
          element.css(ctrl.sizeProperties.sizeProperty, newValue + 'px');
        });

        scope.$watch('splitbar.' + ctrl.sizeProperties.flowProperty, function(newValue, oldValue) {
          element.css(ctrl.sizeProperties.flowProperty, newValue + 'px');
        });

        ctrl.addContainer(scope.splitbar);
      }
    };

  })

  .directive('uiLayoutContainer', function(LayoutContainer, $compile) {
    return {
      restrict: 'AE',
      require: '^uiLayout',
      scope: {},
      transclude: true,
      replace: true,
      template: '<div><div ng-transclude></div></div>',
      compile: function(element, attributes, transcludeFn) {
        var splitbar = angular.element('<div ui-splitbar></div>');
        element.after(splitbar);

        return {
          pre: function(scope, element, attrs, ctrl) {
            scope.container = LayoutContainer.Container();
            scope.container.element = element;
            ctrl.addContainer(scope.container);
          },
          post: function(scope, element, attrs, ctrl) {
            if(!element.hasClass('stretch')) element.addClass('stretch');
            if(!element.hasClass('ui-layout-container')) element.addClass('ui-layout-container');

            scope.$watch('container.size', function(newValue, oldValue) {
              element.css(ctrl.sizeProperties.sizeProperty, newValue + 'px');
            });

            scope.$watch('container.' + ctrl.sizeProperties.flowProperty, function(newValue, oldValue) {
              element.css(ctrl.sizeProperties.flowProperty, newValue + 'px');
            });
          }
        }
      }
    };
  })

  .factory('LayoutContainer', function() {

    // Base container that can be locked and resized
    function BaseContainer() {
      this.size = 0;
      this.maxSize = null;
      this.minSize = 0;
      this.resizable = true;
      this.locked = false;
      this.element = null;
    }

    BaseContainer.prototype.canMoveLength = function(length) {
      var newLength = this.size - length;
      var minSize = this.minSize || 0;
      var minCheckSuccess = (newLength >= minSize) ? true : false;
      var maxCheckSuccess = (this.maxSize == null || newLength < this.maxSize) ? true : false;

      return !this.locked && minCheckSuccess && maxCheckSuccess;
    };

    BaseContainer.prototype.getAvailableLength = function() {
      return this.locked === true ? 0 : this.size - this.minSize;
    };

    // Splitbar container
    function SplitbarContainer() {
      this.size = 10;
      this.left = 0;
      this.top = 0;
      this.element = null;
    }

    SplitbarContainer.prototype.canMoveLength = function() {
      return false;
    };

    SplitbarContainer.prototype.moveLength = function() {
      return 0;
    };

    SplitbarContainer.prototype.getAvailableLength = function() {
      return 0;
    };

    return {
      Container: function(initialSize) {
        return new BaseContainer(initialSize);
      },
      Splitbar: function() {
        return new SplitbarContainer();
      },
      isSplitbar: function(container) {
        return container instanceof SplitbarContainer;
      }
    }
  })
;
