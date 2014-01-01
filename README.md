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
<script type="text/javascript" src="bower_components/angular-ui-layout/layout.js"></script>
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

A fake flex-direction property. wait...


## Testing

We use Karma and jshint to ensure the quality of the code.  The easiest way to run these checks is to use grunt:

```sh
npm install -g grunt-cli
npm install && bower install
grunt
```

The karma task will try to open Firefox and Chrome as browser in which to run the tests.  Make sure this is available or change the configuration in `test\karma.conf.js`


### Grunt Serve

We have one task to serve them all !

```sh
grunt serve
```

It's equal to run separately: 

* `grunt connect:server` : giving you a development server at [http://localhost:8000/](http://127.0.0.1:8000/).

* `grunt karma:unit` : giving you two Karma servers to run tests (at [http://localhost:9876/](http://localhost:9876/) for tests with jQlite and [http://localhost:5432/](http://localhost:5432/) for tests with jQuery). You can force tests on the servers with `grunt karma:unit:run`.

* `grunt watch` : will automatically test your code and build your demo. You can force a demo generation with `grunt dist build:gh-pages`.
