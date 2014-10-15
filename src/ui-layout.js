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
    var cache = {};
    var animationFrameRequested;
    var lastPos;

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
    opts.collapsed = opts.collapsed || [];
    ctrl.opts = opts;

    $scope.updateDisplay = function() {
      console.log(containers);
      ctrl.updateDisplay();
    };

    //================================================================================
    // Private Controller Functions
    //================================================================================
    var mouseUpHandler = function(event) {
      if(ctrl.movingSplitbar !== null) {
        ctrl.movingSplitbar = null;
      }
    };

    var mouseMoveHandler = function(event) {

      lastPos = event[ctrl.sizeProperties.mouseProperty];

      //Cancel previous rAF call
      if(animationFrameRequested) {
        window.cancelAnimationFrame(animationFrameRequested);
      }

      //TODO: cache layout values

      //Animate the page outside the event
      animationFrameRequested = window.requestAnimationFrame(draw);
    };

    /*
    function cacheLayoutValues() {
      if(ctrl.movingSplitbar !== null) {
        var splitbarIndex = containers.indexOf(ctrl.movingSplitbar);
        var processedContainers = ctrl.processSplitbar(containers[splitbarIndex]);

        cache.time = +new Date();
        cache.beforeContainer = angular.extend({}, processedContainers.beforeContainer);
        cache.afterContainer = angular.extend({}, processedContainers.afterContainer);
      }
    }
    */

    function draw() {
      var length = 0;
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

          if(!beforeContainer.collapsed && !afterContainer.collapsed) {
            // calculate container positons
            var difference = ctrl.movingSplitbar[position] - lastPos;
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

            //          console.log('---');
            //          console.log(splitbarIndex, nextSplitbarIndex, containers.length);
            //          console.log('diff:', difference);
            //          console.log('beforeContainer:', beforeContainer);
            //          console.log('afterContainer:', afterContainer);
            //          console.log('---\n');

            // resize the before container
            beforeContainer.size = newPosition - beforeContainer[position];

            // update after container position
            var oldAfterContainerPosition = afterContainer[position];
            afterContainer[position] = newPosition + dividerSize;

            //update after container size if the position has changed
            if(afterContainer[position] != oldAfterContainerPosition) afterContainer.size = (nextSplitbarIndex !== null) ? (oldAfterContainerPosition + afterContainer.size) - (newPosition + dividerSize) : elementSize - (newPosition + dividerSize);

            // move the splitbar
            ctrl.movingSplitbar[position] = newPosition;

            //TODO: dispatch container resize event
          }
        }
      }

      //Enable a new animation frame
      animationFrameRequested = null;
    }

    //================================================================================
    // Public Controller Functions
    //================================================================================
    /**
     * Returns the min and max values of the containers on each side of the container submitted
     * @param container
     * @returns {*}
     */
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

    /**
     * Removes all non-digit characters from the parameter and returns the value as a number.
     * @param num
     * @returns {*}
     */
    ctrl.toNumber = function(num) {
      if(num) {
        var n = Number(num);
        if(parseFloat(num) === n) return n;
        return Number(num.replace(/\D+/g, '')) || null;
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
      return Math.floor(parentSize * (ctrl.toNumber(size) / 100))
    };

    /**
     * Sets the default size for each container.
     */
    ctrl.updateDisplay = function() {
      var c, i;
      var dividerSize = ctrl.toNumber(opts.dividerSize);
      var elementSize = $element[0][ctrl.sizeProperties.offsetName];
      var availableSize = elementSize - (dividerSize * numOfSplitbars);
      var originalSize = availableSize;
      var usedSpace = 0;
      var numOfAutoContainers = 0;

      if(containers.length > 0 && $element.children().length > 0) {
        // remove the last splitbar container from DOM
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
            opts.collapsed[i] = child.attr('collapsed') || opts.collapsed[i] || false;

            // cast collapsed values to boolean
            if(opts.collapsed[i] === 'true') opts.collapsed[i] = true;
            if(opts.collapsed[i] === 'false') opts.collapsed[i] = false;

//            opts.sizes[i] = opts.collapsed[i] ? 0 : child.attr('size') || opts.sizes[i] || 'auto';
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
          c.collapsed = c.collapsed || opts.collapsed[i];

          if(!LayoutContainer.isSplitbar(c)) {
            var newSize = (opts.sizes[i] === 0) ? 0 : ctrl.toNumber(opts.sizes[i]);

            // change the new size when its less the minimum size
            if(c.minSize !== null && newSize < c.minSize) {
              var minDiff = c.minSize - newSize;
              newSize = c.minSize;
              
              // move container back the size difference
              c[ctrl.sizeProperties.flowProperty] -= minDiff;

              // move the previous splitbar back the size difference if it exists
              var previousSplitbar = containers[i-1];
              if(previousSplitbar) previousSplitbar[ctrl.sizeProperties.flowProperty] -= minDiff;

              // subtract the size difference from the previous container if it exists
              var previousContainer = containers[i-2];
              if(previousContainer) previousContainer.size -= minDiff;
            }
            
            //TODO: change the new size when its greater than the maximum size
            if(c.maxSize !== null && newSize > c.maxSize) {

            }

            // set initial size when collapsed
            if(c.collapsed) {
              c.actualSize = newSize;
              newSize = 0;

              //FIXME: set the next containers actual size when the current container is uncollapsed
            }

            c.size = (newSize !== null) ? newSize : autoSize;
          } else {
            c.size = dividerSize;
          }

          usedSpace += c.size;
          //        console.log(availableSize, usedSpace, c.size, numOfAutoContainers, containers.length, containers);
        }
      }


    };

    /**
     * Adds a container to the list of layout containers.
     * @param container
     */
    ctrl.addContainer = function(container) {
      containers.push(container);

      if(LayoutContainer.isSplitbar(container)) {
        numOfSplitbars++;
      }

      ctrl.updateDisplay();
    };

    /**
     * Toggles the container before the provided splitbar
     * @param splitbar
     * @returns {boolean|*|Array}
     */
    ctrl.toggleBefore = function(splitbar) {
      var index = containers.indexOf(splitbar) - 1;

      var c = containers[index];
      c.collapsed = !containers[index].collapsed;

      var nextSplitbar = containers[index+1];
      var nextContainer = containers[index+2];

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
    }

    /**
     * Toggles the container after the provided splitbar
     * @param splitbar
     * @returns {boolean|*|Array}
     */
    ctrl.toggleAfter = function(splitbar) {
      var index = containers.indexOf(splitbar) + 1;
      var c = containers[index];
      var prevSplitbar = containers[index-1];
      var prevContainer = containers[index-2];
      var isLastContainer = index === (containers.length - 1);
      var endDiff;

      c.collapsed = !containers[index].collapsed;

      $scope.$apply(function() {
        if(c.collapsed) {
          c.actualSize = c.size;
          c.size = 0;

          // adds additional pixels so the splitbar moves to the very end of the container
          // to offset the lost space when converting from percents to pixels
          endDiff = (isLastContainer) ? ctrl.bounds[ctrl.sizeProperties.sizeProperty] - c[ctrl.sizeProperties.flowProperty] - c.actualSize : 0;

          if(prevSplitbar) prevSplitbar[ctrl.sizeProperties.flowProperty] += (c.actualSize + endDiff);
          if(prevContainer) prevContainer.size += (c.actualSize + endDiff);

        } else {
          c.size = c.actualSize;

          // adds additional pixels so the splitbar moves back to the proper position
          // to offset the additional space added when collapsing
          endDiff = (isLastContainer) ? ctrl.bounds[ctrl.sizeProperties.sizeProperty] - c[ctrl.sizeProperties.flowProperty] - c.actualSize : 0;

          if(prevSplitbar) prevSplitbar[ctrl.sizeProperties.flowProperty] -= (c.actualSize + endDiff);
          if(prevContainer) prevContainer.size -= (c.actualSize + endDiff);
        }
      });

      return c.collapsed;
    }

    /**
     * Returns the container object of the splitbar that is before the one passed in.
     * @param currentSplitbar
     */
    ctrl.getPreviousSplitbarContainer = function(currentSplitbar) {
      if(LayoutContainer.isSplitbar(currentSplitbar)) {
        var currentSplitbarIndex = containers.indexOf(currentSplitbar);
        var previousSplitbarIndex = currentSplitbarIndex - 2;
        if(previousSplitbarIndex >= 0) {
          return containers[previousSplitbarIndex];
        }
        return null;
      }
      return null;
    }

    /**
     * Returns the container object of the splitbar that is after the one passed in.
     * @param currentSplitbar
     */
    ctrl.getNextSplitbarContainer = function(currentSplitbar) {
      if(LayoutContainer.isSplitbar(currentSplitbar)) {
        var currentSplitbarIndex = containers.indexOf(currentSplitbar);
        var nextSplitbarIndex = currentSplitbarIndex + 2;
        if(currentSplitbarIndex > 0 && nextSplitbarIndex < containers.length) {
          return containers[nextSplitbarIndex];
        }
        return null;
      }
      return null;
    }

    //================================================================================
    // Event Handlers
    //================================================================================
    $element.bind('mouseup', function(event) {
      $scope.$apply(angular.bind(ctrl, mouseUpHandler, event));
    });

    $element.bind('mousemove', function(event) {
      $scope.$apply(angular.bind(ctrl, mouseMoveHandler, event));
    });

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

        var mouseDownHandler = function(event) {
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

        //Add splitbar to layout container list
        ctrl.addContainer(scope.splitbar);
      }
    };

  })

  .directive('uiLayoutContainer', function(LayoutContainer, $compile) {
    var _splitbar;
    return {
      restrict: 'AE',
      require: '^uiLayout',
      scope: {},

      compile: function(element, attributes, transcludeFn) {
        var splitbar = _splitbar = angular.element('<div ui-splitbar><a><span class="glyphicon"></span></a><a><span class="glyphicon"></span></a></div>');
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
              console.log()
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
    }
  })
;
