"use strict";

var _class, _dec, _class2, _dec2, _class3, _class4, _class5, _descriptor, _temp, _class7, _dec3, _dec4, _dec5, _class8;

function _initializerDefineProperty(target, property, descriptor, context) { if (!descriptor) return; Object.defineProperty(target, property, { enumerable: descriptor.enumerable, configurable: descriptor.configurable, writable: descriptor.writable, value: descriptor.initializer ? descriptor.initializer.call(context) : void 0 }); }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) { var desc = {}; Object.keys(descriptor).forEach(function (key) { desc[key] = descriptor[key]; }); desc.enumerable = !!desc.enumerable; desc.configurable = !!desc.configurable; if ('value' in desc || desc.initializer) { desc.writable = true; } desc = decorators.slice().reverse().reduce(function (desc, decorator) { return decorator(target, property, desc) || desc; }, desc); if (context && desc.initializer !== void 0) { desc.value = desc.initializer ? desc.initializer.call(context) : void 0; desc.initializer = undefined; } if (desc.initializer === void 0) { Object.defineProperty(target, property, desc); desc = null; } return desc; }

function _initializerWarningHelper(descriptor, context) { throw new Error('Decorating class property failed. Please ensure that ' + 'proposal-class-properties is enabled and set to use loose mode. ' + 'To use proposal-class-properties in spec mode with decorators, wait for ' + 'the next major version of decorators in stage 2.'); }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(source, true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(source).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/* disable-eslint */

/**
 * 装饰器 decorator
 * 作用：
 * 1. 可以起到标记或者说注释的作用，@testable
 * 2. 可以很方便的对类和类的属性进行限制，如 @readonly
 * 3. 封装解耦的目的，想想是不是和组件很像，组件也是暴露几个 props，而装饰器是暴露几个参数，把内部逻辑封装，@connect
 */
var assert = require('assert'); // ------------------------ 修饰 class  -----------------------------

/* 
装饰器的本质是一个根据装饰位置接受不同参数的函数
@decorator
class A
等同于
A = decorator(A) || A
 */


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
// 如果想修改实例属性，可以设置类的 prototype

var mixin = function mixin() {
  for (var _len = arguments.length, list = new Array(_len), _key = 0; _key < _len; _key++) {
    list[_key] = arguments[_key];
  }

  return function (target) {
    Object.assign.apply(Object, [target.prototype].concat(list));
  };
};

var helloObj = {
  hello: function hello() {
    console.log('hello');
  }
};
var Person = (_dec2 = mixin(helloObj), _dec2(_class3 = function Person() {
  _classCallCheck(this, Person);
}) || _class3);
new Person().hello(); // 如何修改实例属性？ 貌似 target.prototype.constructor 只是指向了 constructor，使用 new 调用的海事原来的 constructor

var uuid = function () {
  var uuid = 0;
  return function (target) {
    var oldConstructor = target.prototype.constructor;

    target.prototype.constructor = function () {
      this.uuid = ++uuid;

      for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
        args[_key2] = arguments[_key2];
      }

      return Reflect.apply(oldConstructor, this, args);
    };
  };
}();

var Product = uuid(_class4 = function Product() {
  _classCallCheck(this, Product);
}) || _class4;

console.log(new Product()); // => {}
// 实现 react-redux 库的 connect 装饰器

var connect = function connect(mapStateToProps, mapDispatchToProps) {
  return function (target) {
    Object.assign(target, {
      mapStateToProps: mapStateToProps,
      mapDispatchToProps: mapDispatchToProps
    });
  };
}; // ------------------------  修饰 class 属性 -----------------------------


var readonly = function readonly(prototype, prop, descriptor) {
  return _objectSpread({}, descriptor, {
    writable: false
  });
};

var nonenumerable = function nonenumerable(prototype, prop, descriptor) {
  return _objectSpread({}, descriptor, {
    enumerable: false
  });
}; // 类的方法默认就是不可遍历的


var Good = (_class5 = (_temp =
/*#__PURE__*/
function () {
  function Good() {
    _classCallCheck(this, Good);

    _initializerDefineProperty(this, "constName", _descriptor, this);

    this.type = 'Good';
  }

  _createClass(Good, [{
    key: "equals",
    value: function equals() {}
  }, {
    key: "kidCount",
    get: function get() {
      return this.children.length;
    }
  }]);

  return Good;
}(), _temp), (_descriptor = _applyDecoratedDescriptor(_class5.prototype, "constName", [readonly, nonenumerable], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _applyDecoratedDescriptor(_class5.prototype, "equals", [readonly], Object.getOwnPropertyDescriptor(_class5.prototype, "equals"), _class5.prototype), _applyDecoratedDescriptor(_class5.prototype, "kidCount", [nonenumerable], Object.getOwnPropertyDescriptor(_class5.prototype, "kidCount"), _class5.prototype)), _class5);
var good = new Good(); // good.name = 'ly'; // => TypeError: Cannot assign to read only property 'name' of object '#<Good>'

console.log('kidCount' in good); // true
// log 装饰器，调用函数时会输出调用日志

var log = function log(prototype, prop, descriptor) {
  var oldFunc = descriptor.value;
  return _objectSpread({}, descriptor, {
    value: function value() {
      console.log("Call function: ".concat(prop, "..."));

      for (var _len3 = arguments.length, args = new Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
        args[_key3] = arguments[_key3];
      }

      return Reflect.apply(oldFunc, this, args);
    }
  });
};

var Worker = (_class7 =
/*#__PURE__*/
function () {
  function Worker() {
    _classCallCheck(this, Worker);
  }

  _createClass(Worker, [{
    key: "work",
    value: function work() {
      console.log('摸鱼...');
    }
  }]);

  return Worker;
}(), (_applyDecoratedDescriptor(_class7.prototype, "work", [log], Object.getOwnPropertyDescriptor(_class7.prototype, "work"), _class7.prototype)), _class7);
new Worker().work(); // 装饰器的执行顺序

var decoratorA = function decoratorA() {
  console.log('A enter');
  return function (target) {
    console.log('A execute');
  };
};

var decoratorB = function decoratorB() {
  console.log('B enter');
  return function (target) {
    console.log('B execute');
  };
};

var decoratorC = function decoratorC() {
  console.log('C enter');
  return function (target) {
    console.log('C execute');
  };
};

var TestDecoratorExecuteOrder = (_dec3 = decoratorA(), _dec4 = decoratorB(), _dec5 = decoratorC(), _dec3(_class8 = _dec4(_class8 = _dec5(_class8 = function TestDecoratorExecuteOrder() {
  _classCallCheck(this, TestDecoratorExecuteOrder);
}) || _class8) || _class8) || _class8); // => 像剥洋葱一样，先由外到内生成所有装饰器，再从最里面的装饰器执行到外
// A enter
// B enter
// B execute
// A execute