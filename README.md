# UI.Layout directive [![Build Status](https://travis-ci.org/angular-ui/ui-layout.png)](https://travis-ci.org/angular-ui/ui-layout)

This directive allows you to split stuff !  
[Holy grail demo](http://plnkr.co/k74rGs)

## Requirements

- AngularJS

## Usage

```xml
<div ui-layout="{ flow : 'row' }"></div>
or
<ui-layout options="{ flow : 'row' }"></ui-layout>
```


```xml
<ui-layout options="{ flow : 'row' }">
  <header></header>
  <ui-layout options="{ flow : 'column' }">
    <sidebar></sidebar>
    <div></div>
    <sidebar></sidebar>
  </ui-layout>
  <footer></footer>
</ui-layout>
```