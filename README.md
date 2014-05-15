# UI.Layout directive [![Build Status](https://travis-ci.org/angular-ui/ui-layout.png)](https://travis-ci.org/angular-ui/ui-layout)

This directive allows you to split stuff !  
[Holy grail demo](http://plnkr.co/k74rGs)

## Requirements

- AngularJS

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
