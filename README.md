# UI.Layout directive [![Build Status](https://travis-ci.org/angular-ui/ui-layout.svg)](https://travis-ci.org/angular-ui/ui-layout)

This directive allows you to split stuff !
[Holy grail demo](http://plnkr.co/zB4mhgJyVz7GlwG8JmeM)

## Requirements

- AngularJS

**NOTE :** if you use IE<=9, iOS<7 or Android<4 please include the [requestAnimationFrame polyfill](https://github.com/darius/requestAnimationFrame/blob/master/requestAnimationFrame.js) in your application.

**NOTE :** version 1.x is only compatible with IE>=10. If you use IE<=9 you need to use version 0.x


## Usage

You can get it from [Bower](http://bower.io/)

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

Finally, add the directive to your html:


```xml
<div ui-layout="{ flow : 'row' }"></div>
or
<ui-layout options="{ flow : 'row' }"></ui-layout>
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
