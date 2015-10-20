# UI.Layout directive [![Build Status](https://travis-ci.org/angular-ui/ui-layout.svg)](https://travis-ci.org/angular-ui/ui-layout)

This directive allows you to split stuff !
[Holy grail demo](http://plnkr.co/zB4mhgJyVz7GlwG8JmeM)

## Requirements

- AngularJS

**NOTE :** if you use IE<=9, iOS<7 or Android<4 please include the [requestAnimationFrame polyfill](https://github.com/darius/requestAnimationFrame/blob/master/requestAnimationFrame.js) in your application.

**NOTE :** version 1.x is only compatible with IE>=10. If you use IE<=9 you need to use version 0.x


## Installing

### Browserify/WebPack

```sh
npm install --save angular-ui-layout
```

`module.exports` of `index.js` is the string `'ui.layout'` so you can include it as such:

```javascript
angular.module('myApp', [require('angular-ui-layout')]);
```

### [Bower](http://bower.io/)

```sh
bower install angular-ui-layout\#bower
# or
bower install angular-ui-layout\#v0.0.0
# or
bower install angular-ui-layout\#src0.0.0
```

This will copy the UI.Layout files into a `bower_components` folder, along with its dependencies. Load the script files in your application:

```html
<link rel="stylesheet" type="text/css" href="bower_components/angular-ui-layout/ui-layout.css"/>
<!-- ... -->
<script type="text/javascript" src="bower_components/raf/index.js"></script>
<script type="text/javascript" src="bower_components/angular-ui-layout/ui-layout.js"></script>
```

Add the UI.Layout module as a dependency to your application module:

```javascript
var myAppModule = angular.module('MyApp', ['ui.layout']);
```

## Usage

Add the directive like so:

```xml
<div ui-layout="{ flow : 'row' }"></div>
or
<ui-layout options="{ flow : 'row' }"></ui-layout>
```

If using a `layout-container` with `ng-repeat`, make sure to include a `track by` clause to the repeat, typically with $index:

```xml
<div ui-layout="{flow : 'column'}" class="maincontainer" >
  <div ui-layout-container ng-repeat="item in items track by $index"></div>
</div>
```

## Options

### flow

Type: `String`
Default: `'row'`
`flow: row | column`

A fake [flex-direction property](http://www.w3.org/TR/css3-flexbox/#flex-direction). It specifies how the child elements are placed in the layout container, by setting the direction of the flex container's main axis. This determines the direction that child elements are laid out in.

### dividerSize

Type: `Integer`
Default: `10`

The size in pixels that you want the divider/splitbar to be.

### disableToggle

Type: `Boolean`
Default: `false`

Set to `true` if you don't want the toggle arrows appearing in the splitbar.

### disableMobileToggle

Type: `Boolean`
Default: `false`

Like `disableToggle` above but only removes the arrows on mobile devices (max-device-width: 480px).

## Child Attributes

### uiLayoutContainer

Required on all child elements of the ui-layout element.

```
<div ui-layout>
    <div ui-layout-container></div>    
    <div ui-layout-container></div>    
</div>
```

### size
Type: `String`

Sets the default placement of the splitbar.

```
pixels
<div ui-layout>
    <div ui-layout-container size="100px"></div>
</div>

percentage
<div ui-layout>
    <div ui-layout-container size="10%"></div>
</div>
```

### minSize

Type: `String`
Default: `'8px'`

Specifices the minimum size the child element can be set to. Defaults to the width of the `splitbar` if no value is provided.

```
pixels
<div ui-layout>
    <div ui-layout-container min-size="100px"></div>
</div>

percentage
<div ui-layout>
    <div ui-layout-container min-size="10%"></div>
</div>
```

### maxSize

Type: `String`

Specifices the maxium size the child element can be set to.

```
pixels
<div ui-layout>
    <div ui-layout-container max-size="100px"></div>
</div>

percentage
<div ui-layout>
    <div ui-layout-container max-size="10%"></div>
</div>
```

## Events

Events are broadcast on the scope where ui-layout is attached. This means they are available to any controller inside of a ui-layout container. 

### ui.layout.toggle

Dispatched when a container is opened or closed using the chevron buttons.

```javascript
$scope.$on('ui.layout.toggle', function(e, container){
  if ( container.size > 0 ){
     console.log('container is open!');
  }
});
```

### ui.layout.resize

Dispatched as a splitbar is dragged, debounced to occur only every 50ms.

```javascript
$scope.$on('ui.layout.resize', function(e, beforeContainer, afterContainer){});
```


## Testing

We use Karma and jshint to ensure the quality of the code.  The easiest way to run these checks is to use grunt:

```sh
npm install -g gulp
npm install && bower install
gulp
```

The karma task will try to open Firefox and Chrome as browser in which to run the tests.  Make sure this is available or change the configuration in `test\karma-jqlite.conf.js` and `test\karma-jquery.conf.js`

Some test tasks :
 - `gulp karma` : Will run _jqlite_ and _jquery_ tests in simple run mode,
 - `gulp karma:jqlite:unit` : Will run _jqlite_ tests in simple run mode,
 - `gulp karma:jquery:unit` : Will run _jquery_ tests in simple run mode,
 - `gulp karma:jqlite:watch` : Will run _jqlite_ tests and watch for changes,
 - `gulp karma:jquery:watch` : Will run _jquery_ tests and watch for changes,

** `gulp serve` runs and watches all**
