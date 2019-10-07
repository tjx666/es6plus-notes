"use strict";

var _class, _dec, _class2;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/* disable-eslint */

/**
 * 装饰器 decorator
 */
var assert = require('assert'); // ------------------------ 修饰 class  -----------------------------
// 装饰器的本质是一个根据装饰位置接受不同参数的函数


var testable = function testable(target) {
  target.isTestable = true;
};
/**
 * 修饰 class 时，装饰器函数只接受一个参数 target
 */


var TestableClass = testable(_class = function TestableClass() {
  _classCallCheck(this, TestableClass);
}) || _class;

assert.ok(TestableClass.isTestable); // 如果装饰器需要接受参数，可以使用闭包函

var restify = function restify(url) {
  return function (target) {
    target.url = url;
  };
};

var Article = (_dec = restify('/article'), _dec(_class2 = function Article() {
  _classCallCheck(this, Article);
}) || _class2);
console.log(Article.url); // => /article