"use strict";

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance"); }

function _iterableToArrayLimit(arr, i) { if (!(Symbol.iterator in Object(arr) || Object.prototype.toString.call(arr) === "[object Arguments]")) { return; } var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance"); }

function _iterableToArray(iter) { if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } }

/* eslint-disable no-undef */

/**
 * proxy 是个需要深刻理解和掌握的知识点，许多框架如 vue，mobx, immer 等底层都使用了 proxy 实现响应式，观察者模式等
 * vue3 将使用 proxy 代替 Object.define，旨在提高性能和带来更多扩展性
 * proxy 极大的增强了 javascript 的元编程的能力
 */
// ----------------------- 基本使用 -----------------------------
// proxy 的使用方式就是通过 new 构造一个代理对象，也可以在原型上继承一个代理对象来拦截对代理对象的各种操作
var util = require('util');

var me = {
  name: 'YuTengjing',
  age: 22,
  girlFriend: '😏'
};
var meProxy = new Proxy(me, {
  get: function get(target, property, receiver) {
    // console.log(`You want to get ${property}`);
    if (property === 'girlFriend') return "It's a secret!";
    return target[property];
  },
  set: function set(target, property, value, receiver) {
    if (['name, age, girlFriend'].includes(property)) {
      console.log("You want to set ".concat(property, ". but no body can set my information, haha..."));
    } else {
      target[property] = value;
    }
  }
}); // 要想设置的拦截器起作用，我们需要对返回的 proxy 对象操作而不是原对象，下面直接访问就不会有额外的输出

console.log(me.name); // => YuTengjing

console.log(me.girlFriend); // => 😏
// 对代理对象的操作才能被拦截

console.log(meProxy.name);
/*
 -> You want to get name
 -> YuTengjing
 */

console.log(meProxy.girlFriend); // => It's a secret!

meProxy.age = 21; // => You want to set age. but no body can set my information, haha...

console.log(meProxy.age); // => 22
// => You want to get age
// 将代理对象设置为一个属性

me.proxy = meProxy;
console.log(me.proxy.name); // You want to get name
// YuTengjing
// 将代理设置为原型

var testObj = Object.create(new Proxy({}, {
  get: function get(target, property) {
    if (target.hasOwnProperty(property)) {
      return target[property];
    }

    throw new Error("The target object doesn't own the property: ".concat(property, " itself"));
  }
}), {
  saying: {
    value: 'In me the tiger, sniffers the rose'
  }
});
console.log(testObj.saying); // => In me the tiger, sniffers the rose
// console.log(testObj.abc); // Error: The target object doesn't own the property: abc itself
// 怎样判断一个对象是否为代理对象
// 下面两种常规方式无效

console.log(meProxy.__proto__.constructor); // => [Function: Object]

console.log(Object.prototype.toString.call(meProxy)); // => [object Object]
// only node

console.log(util.types.isProxy(meProxy)); // true
// proxy 对象可以被代理吗？
// 可以，下面的 createEnum 函数就是将 proxy 对象作为 target 构造一个新的 proxy 对象

var NOPE = function NOPE() {
  throw new Error("Can't modify read-only view");
};

var NOPE_HANDLER = {
  set: NOPE,
  defineProperty: NOPE,
  deleteProperty: NOPE,
  preventExtensions: NOPE,
  setPrototypeOf: NOPE
};

var readOnlyView = function readOnlyView(target) {
  return new Proxy(target, NOPE_HANDLER);
};

var createEnum = function createEnum(target) {
  return readOnlyView(new Proxy(target, {
    get: function get(obj, prop) {
      if (prop in obj) {
        return Reflect.get(obj, prop);
      }

      throw new ReferenceError("Unknown prop \"".concat(prop, "\""));
    }
  }));
};

var SHIRT_SIZES = createEnum({
  S: 10,
  M: 15,
  L: 20
});
SHIRT_SIZES.S; // 10
// SHIRT_SIZES.S = 15
// Uncaught Error: Can't modify read-only view
// SHIRT_SIZES.XL
// Uncaught ReferenceError: Unknown prop "XL"
// ------------------------ get -----------------------------
// 啥时候 get 拦截器会起作用呢？就是通过 obj.property 或者 obj['property'] 访问的时候
// get 方法可以被继承吗？

var proxyObj = new Proxy({}, {
  get: function get(target, property, receiver) {
    console.log("You access the property ".concat(property));
  }
});
var obj = Object.create(proxyObj);
obj.name = 'ly';
console.log(obj.name); // => ly

console.log(obj.undefinedProp); //  You access the property undefinedProp
// undefined
// 所以，结论是不能继承，个人认为如果能继承的话，子类实例应该任何·属性都被拦截，然而事实是只有它本身不存在而在父类上属性才会被拦截
// 数组负值

var createArray = function createArray() {
  for (var _len = arguments.length, elements = new Array(_len), _key = 0; _key < _len; _key++) {
    elements[_key] = arguments[_key];
  }

  return new Proxy(elements, {
    get: function get(target, property, receiver) {
      var index = Number(property);

      if (index < 0) {
        return target[target.length + index];
      }

      return target[index];
    }
  });
};

console.log(createArray('a', 'b', 'c')[-1]); // 将读取属性操作转换成函数调用

var pipe = function pipe(value) {
  var funcArray = [];
  return new Proxy({}, {
    get: function get(target, prop, receiver) {
      if (prop === 'get') {
        return funcArray.reduce(function (computedValue, current) {
          return current(computedValue);
        }, value);
      }

      funcArray.push(global[prop]);
      return receiver;
    }
  });
};

global["double"] = function (num) {
  return num * 2;
};

global.pow = function (num) {
  return Math.pow(num, 2);
};

global.reverseInt = function (num) {
  return num.toString().split('').reverse().join('') | 0;
};

console.log(pipe(3)["double"].pow.reverseInt.get); // => 63
// 利用 proxy 使得一个对象可以在访问任何属性时做同样的事
// 写一个通用的生成各种 DOM 节点的函数

var dom = new Proxy({}, {
  get: function get(target, prop, receiver) {
    return function (attrs) {
      var element = document.createElement(prop);

      _toConsumableArray(Object.entries(attrs)).forEach(function (_ref) {
        var _ref2 = _slicedToArray(_ref, 2),
            key = _ref2[0],
            value = _ref2[1];

        return element.setAttribute(key, value);
      });

      for (var _len2 = arguments.length, children = new Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
        children[_key2 - 1] = arguments[_key2];
      }

      children.forEach(function (child) {
        if (typeof child === 'string') {
          child = document.createTextNode(child);
        }

        element.appendChild(child);
      });
      return element;
    };
  }
}); // ------------------------ set -----------------------------
// 应用场景一：校验被设置的数据
// 这让我想到 java web 中 java bean 通常都要有 getter, setter, setter 的作用不也是可以对设置的数据做校验，避免直接修改带来不可预知的错误

var request = new Proxy({}, {
  set: function set(target, prop, value, receiver) {
    var validMethods = ['GET', 'POST', 'PUT', 'DELETE', 'HEADER', 'OPTION', 'PATCH'];

    if (!validMethods.includes(value)) {
      throw new Error("Method ".concat(value, " is invalid! The valid methods is ").concat(JSON.stringify(validMethods)));
    }

    return true;
  }
}); // request.method = '喵喵喵';
// 应用场景二：禁止修改

_EventEmit.DEFAULT_MAX_LISTENERS_COUNT = 10;

function _EventEmit() {
  var _this = this;

  this.listeners = {};
  this.MAX_LISTENERS_COUNT = EventEmit.DEFAULT_MAX_LISTENERS_COUNT;

  this.addListener = function (event, listener) {
    if (!_this.listeners[event]) _this.listeners[event] = [listener];
    if (_this.listeners[event] && _this.listeners[event].length > _this.MAX_LISTENERS_COUNT) throw new Error("The listeners for event ".concat(event, " had been max(").concat(_this.MAX_LISTENERS_COUNT, ")"));

    _this.listeners[event].push(listener);
  };
}

var EventEmit = new Proxy(_EventEmit, {
  set: function set(target, prop, value, receiver) {
    if (prop === 'DEFAULT_MAX_LISTENERS_COUNT') throw new Error("You can't modify the default max listeners count");
    target[prop] = value;
    return true;
  }
});
var emit = new EventEmit();
emit.addListener('click', function () {}); // EventEmit.DEFAULT_MAX_LISTENERS_COUNT = 99999;
// 应用场景三：响应式

var Vue = function Vue(obj) {
  return new Proxy(obj, {
    set: function set(target, prop, value, receiver) {
      if (prop in target.data) {
        console.log('diff...');
        console.log('re-render...');
      }

      return true;
    }
  });
};

var vm = Vue({
  data: {
    name: 'lyreal666'
  }
});
vm.name = 'ly'; // 什么情况下 receiver 不是指向代理对象本身

proxyObj = new Proxy({}, {
  set: function set(target, prop, value, receiver) {
    target[prop] = receiver;
    return true;
  }
});
testObj = Object.create(proxyObj, {});
proxyObj.age = 22;
testObj.age = 18;
console.log(testObj === testObj.age); // => true
// 严格模式下 set 函数必须返回 true, 否则报错

var testStrictModelProxySet = function testStrictModelProxySet() {
  'use strict';

  var proxyObj = new Proxy({}, {
    set: function set(target, prop, value, receiver) {
      target[prop] = value;
    }
  });
  proxyObj.gf = '???';
}; // testStrictModelProxySet(); // TypeError: 'set' on proxy: trap returned falsish for property 'gf'