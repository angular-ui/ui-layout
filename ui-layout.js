'use strict';

/**
 * UI.Layout
 */
angular.module('ui.layout', [])
  .controller('uiLayoutCtrl', ['$scope', '$attrs', '$element', 'LayoutContainer', function uiLayoutCtrl($scope, $attrs, $element, LayoutContainer) {
    var ctrl = this;
    var opts = angular.extend({}, $scope.$eval($attrs.uiLayout), $scope.$eval($attrs.options));
    var numOfSplitbars = 0;
    var lastDividerRemoved = false;
    //var cache = {};
    var animationFrameRequested;
    var lastPos;

    ctrl.containers = [];
    ctrl.movingSplitbar = null;
    ctrl.bounds = $element[0].getBoundingClientRect();
    ctrl.isUsingColumnFlow = opts.flow === 'column';
    ctrl.sizeProperties = !ctrl.isUsingColumnFlow ?
    { sizeProperty: 'height', offsetSize: 'offsetHeight', offsetPos: 'top', flowProperty: 'top', oppositeFlowProperty: 'bottom', mouseProperty: 'clientY', flowPropertyPosition: 'y' } :
    { sizeProperty: 'width', offsetSize: 'offsetWidth', offsetPos: 'left', flowProperty: 'left', oppositeFlowProperty: 'right', mouseProperty: 'clientX', flowPropertyPosition: 'x' };

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
    opts.collapsed = opts.collapsed || [];
    ctrl.opts = opts;

    $scope.updateDisplay = function() {
      console.log(ctrl.containers);
      ctrl.updateDisplay();
    };

    function draw() {
      var position = ctrl.sizeProperties.flowProperty;
      var dividerSize = parseInt(opts.dividerSize);
      var elementSize = $element[0][ctrl.sizeProperties.offsetSize];

      if(ctrl.movingSplitbar !== null) {
        var splitbarIndex = ctrl.containers.indexOf(ctrl.movingSplitbar);
        var nextSplitbarIndex = (splitbarIndex + 2) < ctrl.containers.length ? splitbarIndex + 2 : null;

        if(splitbarIndex > -1) {
          var processedContainers = ctrl.processSplitbar(ctrl.containers[splitbarIndex]);
          var beforeContainer = processedContainers.beforeContainer;
          var afterContainer = processedContainers.afterContainer;

          if(!beforeContainer.collapsed && !afterContainer.collapsed) {
            // calculate container positons
            var difference = ctrl.movingSplitbar[position] - lastPos;
            var newPosition = ctrl.movingSplitbar[position] - difference;

            // Keep the bar in the window (no left/top 100%)
            newPosition = Math.min(elementSize-dividerSize, newPosition);

            // Keep the bar from going past the previous element min/max values
            if(angular.isNumber(beforeContainer.beforeMinValue) && newPosition < beforeContainer.beforeMinValue) newPosition = beforeContainer.beforeMinValue;
            if(angular.isNumber(beforeContainer.beforeMaxValue) && newPosition > beforeContainer.beforeMaxValue) newPosition = beforeContainer.beforeMaxValue;

            // Keep the bar from going past the next element min/max values
            if(afterContainer !== null &&
               angular.isNumber(afterContainer.afterMinValue) &&
               newPosition > (afterContainer.afterMinValue - dividerSize))
                newPosition = afterContainer.afterMinValue - dividerSize;
            if(afterContainer !== null && angular.isNumber(afterContainer.afterMaxValue) && newPosition < afterContainer.afterMaxValue) newPosition = afterContainer.afterMaxValue;

            // resize the before container
            beforeContainer.size = newPosition - beforeContainer[position];

            // update after container position
            var oldAfterContainerPosition = afterContainer[position];
            afterContainer[position] = newPosition + dividerSize;

            //update after container size if the position has changed
            if(afterContainer[position] != oldAfterContainerPosition)
              afterContainer.size = (nextSplitbarIndex !== null) ? (oldAfterContainerPosition + afterContainer.size) - (newPosition + dividerSize) : elementSize - (newPosition + dividerSize);

            // move the splitbar
            ctrl.movingSplitbar[position] = newPosition;

            //TODO: dispatch container resize event
          }
        }
      }

      //Enable a new animation frame
      animationFrameRequested = null;
    }

    function offset(element) {
      var rawDomNode = element[0];
      var body = document.documentElement || document.body;
      var scrollX = window.pageXOffset || body.scrollLeft;
      var scrollY = window.pageYOffset || body.scrollTop;
      var clientRect = rawDomNode.getBoundingClientRect();
      var x = clientRect.left + scrollX;
      var y = clientRect.top + scrollY;
      return { left: x, top: y };
    }

    //================================================================================
    // Public Controller Functions
    //================================================================================
    ctrl.mouseUpHandler = function(event) {
      if(ctrl.movingSplitbar !== null) {
        ctrl.movingSplitbar = null;
      }
      return event;
    };

    ctrl.mouseMoveHandler = function(mouseEvent) {
      var mousePos = mouseEvent[ctrl.sizeProperties.mouseProperty] ||
        (mouseEvent.originalEvent && mouseEvent.originalEvent[ctrl.sizeProperties.mouseProperty]) ||
        (mouseEvent.targetTouches ? mouseEvent.targetTouches[0][ctrl.sizeProperties.mouseProperty] : 0);

      lastPos = mousePos - offset($element)[ctrl.sizeProperties.offsetPos];

      //Cancel previous rAF call
      if(animationFrameRequested) {
        window.cancelAnimationFrame(animationFrameRequested);
      }

      //TODO: cache layout values

      //Animate the page outside the event
      animationFrameRequested = window.requestAnimationFrame(draw);
    };

    /**
     * Returns the min and max values of the ctrl.containers on each side of the container submitted
     * @param container
     * @returns {*}
     */
    ctrl.processSplitbar = function(container) {
      var index = ctrl.containers.indexOf(container);

      var setValues = function(container) {
        var start = container[ctrl.sizeProperties.flowProperty];
        var end = container[ctrl.sizeProperties.flowProperty] + container.size;

        container.beforeMinValue = angular.isNumber(container.minSize) ? start + container.minSize : start;
        container.beforeMaxValue = angular.isNumber(container.maxSize) ? start + container.maxSize : null;

        container.afterMinValue = angular.isNumber(container.minSize) ? end - container.minSize : end;
        container.afterMaxValue = angular.isNumber(container.maxSize) ? end - container.maxSize : null;
      };

      //verify the container was found in the list
      if(index > -1) {
        var beforeContainer = (index > 0) ? ctrl.containers[index-1] : null;
        var afterContainer = ((index+1) <= ctrl.containers.length) ? ctrl.containers[index+1] : null;

        if(beforeContainer !== null) setValues(beforeContainer);
        if(afterContainer !== null) setValues(afterContainer);

        return {
          beforeContainer: beforeContainer,
          afterContainer: afterContainer
        };
      }

      return null;
    };

    /**
     * Checks if a string has a percent symbol in it.
     * @param num
     * @returns {boolean}
     */
    ctrl.isPercent = function(num) {
      return (num && angular.isString(num) && num.indexOf('%') > -1) ? true : false;
    };

    /**
     * Converts a number to pixels from percent.
     * @param size
     * @param parentSize
     * @returns {number}
     */
    ctrl.convertToPixels = function(size, parentSize) {
      return Math.floor(parentSize * (parseInt(size) / 100));
    };

    /**
     * Sets the default size for each container.
     */
    ctrl.updateDisplay = function() {
      var c, i;
      var dividerSize = parseInt(opts.dividerSize);
      var elementSize = $element[0].getBoundingClientRect()[ctrl.sizeProperties.sizeProperty];
      var availableSize = elementSize - (dividerSize * numOfSplitbars);
      var originalSize = availableSize;
      var usedSpace = 0;
      var numOfAutoContainers = 0;

      if(ctrl.containers.length > 0 && $element.children().length > 0) {
        // remove the last splitbar container from DOM
        if(!lastDividerRemoved && ctrl.containers.length === $element.children().length) {
          var lastContainerIndex = ctrl.containers.length - 1;
          ctrl.containers[lastContainerIndex].element.remove();
          ctrl.containers.splice(lastContainerIndex, 1);
          lastDividerRemoved = true;
          numOfSplitbars--;
        }

        // calculate sizing for ctrl.containers
        for(i=0; i < ctrl.containers.length; i++) {
          if(!LayoutContainer.isSplitbar(ctrl.containers[i])) {
            var child = ctrl.containers[i].element;
            opts.maxSizes[i] = child.attr('max-size') || opts.maxSizes[i] || null;
            opts.minSizes[i] = child.attr('min-size') || opts.minSizes[i] || null;
            opts.sizes[i] = child.attr('size') || opts.sizes[i] || 'auto';
            //opts.collapsed[i] = child.attr('collapsed') || opts.collapsed[i] || false;

            // verify size is properly set to pixels or percent
            var sizePattern = /\d+\s*(px|%)\s*$/i;
            opts.sizes[i] = (opts.sizes[i] != 'auto' && opts.sizes[i].match(sizePattern)) ? opts.sizes[i] : 'auto';
            opts.minSizes[i] = (opts.minSizes[i] && opts.minSizes[i].match(sizePattern)) ? opts.minSizes[i] : null;
            opts.maxSizes[i] = (opts.maxSizes[i] && opts.maxSizes[i].match(sizePattern)) ? opts.maxSizes[i] : null;

            if(opts.sizes[i] != 'auto') {
              if(ctrl.isPercent(opts.sizes[i])) {
                opts.sizes[i] = ctrl.convertToPixels(opts.sizes[i], originalSize);
              } else {
                opts.sizes[i] = parseInt(opts.sizes[i]);
              }
            }

            if(opts.minSizes[i] != null) {
              if(ctrl.isPercent(opts.minSizes[i])) {
                opts.minSizes[i] = ctrl.convertToPixels(opts.minSizes[i], originalSize);
              } else {
                opts.minSizes[i] = parseInt(opts.minSizes[i]);
              }

              // don't allow the container size to initialize smaller than the minSize
              if(opts.sizes[i] < opts.minSizes[i]) opts.sizes[i] = opts.minSizes[i];
            }

            if(opts.maxSizes[i] != null) {
              if(ctrl.isPercent(opts.maxSizes[i])) {
                opts.maxSizes[i] = ctrl.convertToPixels(opts.maxSizes[i], originalSize);
              } else {
                opts.maxSizes[i] = parseInt(opts.maxSizes[i]);
              }

              // don't allow the container size to intialize larger than the maxSize
              if(opts.sizes[i] > opts.maxSizes[i]) opts.sizes[i] = opts.maxSizes[i];
            }

            if(opts.sizes[i] === 'auto') {
              numOfAutoContainers++;
            } else {
              availableSize -= opts.sizes[i];
            }
          }
        }

        // set the sizing for the ctrl.containers
        var autoSize = Math.floor(availableSize / numOfAutoContainers);
        for(i=0; i < ctrl.containers.length; i++) {
          c = ctrl.containers[i];
          c[ctrl.sizeProperties.flowProperty] = usedSpace;
          c.maxSize = opts.maxSizes[i];
          c.minSize = opts.minSizes[i];

          c.collapsed = c.collapsed || opts.collapsed[i];

          //TODO: adjust size if autosize is greater than the maxSize

          if(!LayoutContainer.isSplitbar(c)) {
            var newSize = (opts.sizes[i] === 'auto') ? autoSize : opts.sizes[i];

            c.size = (newSize !== null) ? newSize : autoSize;
          } else {
            c.size = dividerSize;
          }

          usedSpace += c.size;
        }
      }


    };

    /**
     * Adds a container to the list of layout ctrl.containers.
     * @param container
     */
    ctrl.addContainer = function(container) {
      ctrl.containers.push(container);

      if(LayoutContainer.isSplitbar(container)) {
        numOfSplitbars++;
      }

      ctrl.updateDisplay();
    };

    /**
     * Returns an array of layout ctrl.containers.
     * @returns {Array}
     */
    ctrl.getContainers = function() {
      return ctrl.containers;
    };

    /**
     * Toggles the container before the provided splitbar
     * @param splitbar
     * @returns {boolean|*|Array}
     */
    ctrl.toggleBefore = function(splitbar) {
      var index = ctrl.containers.indexOf(splitbar) - 1;

      var c = ctrl.containers[index];
      c.collapsed = !ctrl.containers[index].collapsed;

      var nextSplitbar = ctrl.containers[index+1];
      var nextContainer = ctrl.containers[index+2];

      $scope.$apply(function() {
        if(c.collapsed) {
          c.actualSize = c.size;
          c.size = 0;

          if(nextSplitbar) nextSplitbar[ctrl.sizeProperties.flowProperty] -= c.actualSize;
          if(nextContainer) {
            nextContainer[ctrl.sizeProperties.flowProperty] -= c.actualSize;
            nextContainer.size += c.actualSize;
          }

        } else {
          c.size = c.actualSize;

          if(nextSplitbar) nextSplitbar[ctrl.sizeProperties.flowProperty] += c.actualSize;
          if(nextContainer) {
            nextContainer[ctrl.sizeProperties.flowProperty] += c.actualSize;
            nextContainer.size -= c.actualSize;
          }
        }
      });

      return c.collapsed;
    };

    /**
     * Toggles the container after the provided splitbar
     * @param splitbar
     * @returns {boolean|*|Array}
     */
    ctrl.toggleAfter = function(splitbar) {
      var index = ctrl.containers.indexOf(splitbar) + 1;
      var c = ctrl.containers[index];
      var prevSplitbar = ctrl.containers[index-1];
      var prevContainer = ctrl.containers[index-2];
      var isLastContainer = index === (ctrl.containers.length - 1);
      var endDiff;

      ctrl.bounds = $element[0].getBoundingClientRect();

      c.collapsed = !ctrl.containers[index].collapsed;

      $scope.$apply(function() {
        if(c.collapsed) {
          c.actualSize = c.size;
          c.size = 0;

          // adds additional space so the splitbar moves to the very end of the container
          // to offset the lost space when converting from percents to pixels
          endDiff = (isLastContainer) ? ctrl.bounds[ctrl.sizeProperties.sizeProperty] - c[ctrl.sizeProperties.flowProperty] - c.actualSize : 0;

          if(prevSplitbar) prevSplitbar[ctrl.sizeProperties.flowProperty] += (c.actualSize + endDiff);
          if(prevContainer) prevContainer.size += (c.actualSize + endDiff);

        } else {
          c.size = c.actualSize;

          // adds additional space so the splitbar moves back to the proper position
          // to offset the additional space added when collapsing
          endDiff = (isLastContainer) ? ctrl.bounds[ctrl.sizeProperties.sizeProperty] - c[ctrl.sizeProperties.flowProperty] - c.actualSize : 0;

          if(prevSplitbar) prevSplitbar[ctrl.sizeProperties.flowProperty] -= (c.actualSize + endDiff);
          if(prevContainer) prevContainer.size -= (c.actualSize + endDiff);
        }
      });

      return c.collapsed;
    };

    /**
     * Returns the container object of the splitbar that is before the one passed in.
     * @param currentSplitbar
     */
    ctrl.getPreviousSplitbarContainer = function(currentSplitbar) {
      if(LayoutContainer.isSplitbar(currentSplitbar)) {
        var currentSplitbarIndex = ctrl.containers.indexOf(currentSplitbar);
        var previousSplitbarIndex = currentSplitbarIndex - 2;
        if(previousSplitbarIndex >= 0) {
          return ctrl.containers[previousSplitbarIndex];
        }
        return null;
      }
      return null;
    };

    /**
     * Returns the container object of the splitbar that is after the one passed in.
     * @param currentSplitbar
     */
    ctrl.getNextSplitbarContainer = function(currentSplitbar) {
      if(LayoutContainer.isSplitbar(currentSplitbar)) {
        var currentSplitbarIndex = ctrl.containers.indexOf(currentSplitbar);
        var nextSplitbarIndex = currentSplitbarIndex + 2;
        if(currentSplitbarIndex > 0 && nextSplitbarIndex < ctrl.containers.length) {
          return ctrl.containers[nextSplitbarIndex];
        }
        return null;
      }
      return null;
    };

    return ctrl;
  }])

  .directive('uiLayout', ['$window', function($window) {
    return {
      restrict: 'AE',
      controller: 'uiLayoutCtrl',
      link: function(scope, element, attrs, ctrl) {
        scope.$watch(element[0][ctrl.sizeProperties.offsetSize], function() {
          ctrl.updateDisplay();
        });

        function onResize() {
          scope.$apply(function() {
            ctrl.updateDisplay();
          });
        }

        angular.element($window).bind('resize', onResize);

        scope.$on('$destroy', function() {
          angular.element($window).unbind('resize', onResize);
        });
      }
    };
  }])

  .directive('uiSplitbar', ['LayoutContainer', function(LayoutContainer) {
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

        //chevron <a> elements
        var prevButton = angular.element(element.children()[0]);
        var afterButton = angular.element(element.children()[1]);

        //chevron <span> elements
        var prevChevron = angular.element(prevButton.children()[0]);
        var afterChevron = angular.element(afterButton.children()[0]);

        //chevron bootstrap classes
        var chevronLeft = 'glyphicon-chevron-left';
        var chevronRight = 'glyphicon-chevron-right';
        var chevronUp = 'glyphicon-chevron-up';
        var chevronDown = 'glyphicon-chevron-down';

        var prevChevronClass = ctrl.isUsingColumnFlow ? chevronLeft : chevronUp;
        var afterChevronClass = ctrl.isUsingColumnFlow ? chevronRight : chevronDown;

        prevChevron.addClass(prevChevronClass);
        afterChevron.addClass(afterChevronClass);

        prevButton.on('click', function() {
          var prevSplitbarBeforeButton, prevSplitbarAfterButton;
          var result = ctrl.toggleBefore(scope.splitbar);
          var previousSplitbar = ctrl.getPreviousSplitbarContainer(scope.splitbar);

          if(previousSplitbar !== null) {
            prevSplitbarBeforeButton = angular.element(previousSplitbar.element.children()[0]);
            prevSplitbarAfterButton = angular.element(previousSplitbar.element.children()[1]);
          }

          if(ctrl.isUsingColumnFlow) {
            if(result) {
              afterButton.css('display', 'none');
              prevChevron.removeClass(chevronLeft);
              prevChevron.addClass(chevronRight);

              // hide previous splitbar buttons
              if(previousSplitbar !== null) {
                prevSplitbarBeforeButton.css('display', 'none');
                prevSplitbarAfterButton.css('display', 'none');
              }
            } else {
              afterButton.css('display', 'inline');
              prevChevron.removeClass(chevronRight);
              prevChevron.addClass(chevronLeft);

              // show previous splitbar chevrons
              if(previousSplitbar !== null) {
                prevSplitbarBeforeButton.css('display', 'inline');
                prevSplitbarAfterButton.css('display', 'inline');
              }
            }
          } else {
            if(result) {
              afterButton.css('display', 'none');
              prevChevron.removeClass(chevronUp);
              prevChevron.addClass(chevronDown);

              // hide previous splitbar buttons
              if(previousSplitbar !== null) {
                prevSplitbarBeforeButton.css('display', 'none');
                prevSplitbarAfterButton.css('display', 'none');
              }
            } else {
              afterButton.css('display', 'inline');
              prevChevron.removeClass(chevronDown);
              prevChevron.addClass(chevronUp);

              // show previous splitbar chevrons
              if(previousSplitbar !== null) {
                prevSplitbarBeforeButton.css('display', 'inline');
                prevSplitbarAfterButton.css('display', 'inline');
              }
            }
          }
        });

        afterButton.on('click', function() {
          var nextSplitbarBeforeButton, nextSplitbarAfterButton;
          var result = ctrl.toggleAfter(scope.splitbar);
          var nextSplitbar = ctrl.getNextSplitbarContainer(scope.splitbar);

          if(nextSplitbar !== null) {
            nextSplitbarBeforeButton = angular.element(nextSplitbar.element.children()[0]);
            nextSplitbarAfterButton = angular.element(nextSplitbar.element.children()[1]);
          }

          if(ctrl.isUsingColumnFlow) {
            if(result) {
              prevButton.css('display', 'none');
              afterChevron.removeClass(chevronRight);
              afterChevron.addClass(chevronLeft);

              // hide next splitbar buttons
              if(nextSplitbar !== null) {
                nextSplitbarBeforeButton.css('display', 'none');
                nextSplitbarAfterButton.css('display', 'none');
              }
            } else {
              prevButton.css('display', 'inline');
              afterChevron.removeClass(chevronLeft);
              afterChevron.addClass(chevronRight);

              // show next splitbar buttons
              if(nextSplitbar !== null) {
                nextSplitbarBeforeButton.css('display', 'inline');
                nextSplitbarAfterButton.css('display', 'inline');
              }
            }
          } else {
            if(result) {
              prevButton.css('display', 'none');
              afterChevron.removeClass(chevronDown);
              afterChevron.addClass(chevronUp);

              // hide next splitbar buttons
              if(nextSplitbar !== null) {
                nextSplitbarBeforeButton.css('display', 'none');
                nextSplitbarAfterButton.css('display', 'none');
              }
            } else {
              prevButton.css('display', 'inline');
              afterChevron.removeClass(chevronUp);
              afterChevron.addClass(chevronDown);

              // show next splitbar buttons
              if(nextSplitbar !== null) {
                nextSplitbarBeforeButton.css('display', 'inline');
                nextSplitbarAfterButton.css('display', 'inline');
              }
            }
          }
        });

        element.on('mousedown touchstart', function(e) {
          ctrl.movingSplitbar = scope.splitbar;
          ctrl.processSplitbar(scope.splitbar);

          e.preventDefault();
          e.stopPropagation();

          htmlElement.on('mousemove touchmove', function(event) {
            scope.$apply(angular.bind(ctrl, ctrl.mouseMoveHandler, event));
          });
          return false;
        });

        htmlElement.on('mouseup touchend', function(event) {
          scope.$apply(angular.bind(ctrl, ctrl.mouseUpHandler, event));
          htmlElement.off('mousemove touchmove');
        });

        scope.$watch('splitbar.size', function(newValue) {
          element.css(ctrl.sizeProperties.sizeProperty, newValue + 'px');
        });

        scope.$watch('splitbar.' + ctrl.sizeProperties.flowProperty, function(newValue) {
          element.css(ctrl.sizeProperties.flowProperty, newValue + 'px');
        });

        //Add splitbar to layout container list
        ctrl.addContainer(scope.splitbar);
      }
    };

  }])

  .directive('uiLayoutContainer', ['LayoutContainer', function(LayoutContainer) {
    return {
      restrict: 'AE',
      require: '^uiLayout',
      scope: {},

      compile: function(element) {
        //TODO: add ability to disable auto-adding a splitbar after the container
        var splitbar = angular.element('<div ui-splitbar><a><span class="glyphicon"></span></a><a><span class="glyphicon"></span></a></div>');
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

            scope.$watch('container.size', function(newValue) {
              element.css(ctrl.sizeProperties.sizeProperty, newValue + 'px');
            });

            scope.$watch('container.' + ctrl.sizeProperties.flowProperty, function(newValue) {
              element.css(ctrl.sizeProperties.flowProperty, newValue + 'px');
            });

          }
        };
      }
    };
  }])

  .factory('LayoutContainer', function() {

    // Base container that can be locked and resized
    function BaseContainer() {
      this.size = 0;
      this.maxSize = null;
      this.minSize = 0;
      this.resizable = true;
      this.locked = false;
      this.element = null;
      this.collapsed = false;
    }

    // Splitbar container
    function SplitbarContainer() {
      this.size = 10;
      this.left = 0;
      this.top = 0;
      this.element = null;
    }

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
    };
  })
;
