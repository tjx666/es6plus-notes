/* eslint-disable no-undef */
/**
 * proxy 是个需要深刻理解和掌握的知识点，许多框架如 vue，mobx, immer 等底层都使用了 proxy 实现响应式，观察者模式等
 * vue3 将使用 proxy 代替 Object.define，旨在提高性能和带来更多扩展性
 * proxy 极大的增强了 javascript 的元编程的能力
 */

// ----------------------- 基本使用 -----------------------------
// proxy 的使用方式就是通过 new 构造一个代理对象，也可以在原型上继承一个代理对象来拦截对代理对象的各种操作
const util = require('util');

const me = {
    name: 'YuTengjing',
    age: 22,
    girlFriend: '😏',
};

const meProxy = new Proxy(me, {
    get(target, property, receiver) {
        // console.log(`You want to get ${property}`);
        if (property === 'girlFriend') return "It's a secret!";
        return target[property];
    },
    set(target, property, value, receiver) {
        if (['name, age, girlFriend'].includes(property)) {
            console.log(`You want to set ${property}. but no body can set my information, haha...`);
        } else {
            target[property] = value;
        }
    },
});

// 要想设置的拦截器起作用，我们需要对返回的 proxy 对象操作而不是原对象，下面直接访问就不会有额外的输出
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
console.log(meProxy.age);
// => 22
// => You want to get age

// 将代理对象设置为一个属性
me.proxy = meProxy;
console.log(me.proxy.name);
// You want to get name
// YuTengjing

// 将代理设置为原型
let testObj = Object.create(
    new Proxy(
        {},
        {
            get: (target, property) => {
                if (target.hasOwnProperty(property)) {
                    return target[property];
                }
                throw new Error(`The target object doesn't own the property: ${property} itself`);
            },
        }
    ),
    {
        saying: {
            value: 'In me the tiger, sniffers the rose',
        },
    }
);
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
const NOPE = () => {
    throw new Error("Can't modify read-only view");
};

const NOPE_HANDLER = {
    set: NOPE,
    defineProperty: NOPE,
    deleteProperty: NOPE,
    preventExtensions: NOPE,
    setPrototypeOf: NOPE,
};

const readOnlyView = target => new Proxy(target, NOPE_HANDLER);

const createEnum = target =>
    readOnlyView(
        new Proxy(target, {
            get: (obj, prop) => {
                if (prop in obj) {
                    return Reflect.get(obj, prop);
                }
                throw new ReferenceError(`Unknown prop "${prop}"`);
            },
        })
    );

let SHIRT_SIZES = createEnum({
    S: 10,
    M: 15,
    L: 20,
});

SHIRT_SIZES.S; // 10
// SHIRT_SIZES.S = 15
// Uncaught Error: Can't modify read-only view

// SHIRT_SIZES.XL
// Uncaught ReferenceError: Unknown prop "XL"

// ------------------------ get -----------------------------
// 啥时候 get 拦截器会起作用呢？就是通过 obj.property 或者 obj['property'] 访问的时候
// get 方法可以被继承吗？

let proxyObj = new Proxy(
    {},
    {
        get: (target, property, receiver) => {
            console.log(`You access the property ${property}`);
        },
    }
);

let obj = Object.create(proxyObj);
obj.name = 'ly';
console.log(obj.name); // => ly
console.log(obj.undefinedProp);
//  You access the property undefinedProp
// undefined

// 所以，结论是不能继承，个人认为如果能继承的话，子类实例应该任何·属性都被拦截，然而事实是只有它本身不存在而在父类上属性才会被拦截

// 数组负值
const createArray = (...elements) => {
    return new Proxy(elements, {
        get: (target, property, receiver) => {
            const index = Number(property);
            if (index < 0) {
                return target[target.length + index];
            }
            return target[index];
        },
    });
};

console.log(createArray('a', 'b', 'c')[-1]);

// 将读取属性操作转换成函数调用
const pipe = value => {
    const funcArray = [];
    return new Proxy(
        {},
        {
            get: (target, prop, receiver) => {
                if (prop === 'get') {
                    return funcArray.reduce((computedValue, current) => current(computedValue), value);
                }

                funcArray.push(global[prop]);
                return receiver;
            },
        }
    );
};

global.double = num => num * 2;
global.pow = num => num ** 2;
global.reverseInt = num =>
    num
        .toString()
        .split('')
        .reverse()
        .join('') | 0;
console.log(pipe(3).double.pow.reverseInt.get); // => 63

// 利用 proxy 使得一个对象可以在访问任何属性时做同样的事
// 写一个通用的生成各种 DOM 节点的函数
const dom = new Proxy(
    {},
    {
        get: (target, prop, receiver) => (attrs, ...children) => {
            const element = document.createElement(prop);
            [...Object.entries(attrs)].forEach(([key, value]) => element.setAttribute(key, value));
            children.forEach(child => {
                if (typeof child === 'string') {
                    child = document.createTextNode(child);
                }
                element.appendChild(child);
            });
            return element;
        },
    }
);

// ------------------------ set -----------------------------
// 应用场景一：校验被设置的数据
// 这让我想到 java web 中 java bean 通常都要有 getter, setter, setter 的作用不也是可以对设置的数据做校验，避免直接修改带来不可预知的错误
const request = new Proxy(
    {},
    {
        set: (target, prop, value, receiver) => {
            const validMethods = ['GET', 'POST', 'PUT', 'DELETE', 'HEADER', 'OPTION', 'PATCH'];
            if (!validMethods.includes(value)) {
                throw new Error(`Method ${value} is invalid! The valid methods is ${JSON.stringify(validMethods)}`);
            }
            return true;
        },
    }
);
// request.method = '喵喵喵';

// 应用场景二：禁止修改
_EventEmit.DEFAULT_MAX_LISTENERS_COUNT = 10;
function _EventEmit() {
    this.listeners = {};
    this.MAX_LISTENERS_COUNT = EventEmit.DEFAULT_MAX_LISTENERS_COUNT;

    this.addListener = (event, listener) => {
        if (!this.listeners[event]) this.listeners[event] = [listener];
        if (this.listeners[event] && this.listeners[event].length > this.MAX_LISTENERS_COUNT)
            throw new Error(`The listeners for event ${event} had been max(${this.MAX_LISTENERS_COUNT})`);
        this.listeners[event].push(listener);
    };
}

const EventEmit = new Proxy(_EventEmit, {
    set: (target, prop, value, receiver) => {
        if (prop === 'DEFAULT_MAX_LISTENERS_COUNT') throw new Error("You can't modify the default max listeners count");
        target[prop] = value;
        return true;
    },
});

const emit = new EventEmit();
emit.addListener('click', () => {});
// EventEmit.DEFAULT_MAX_LISTENERS_COUNT = 99999;

// 应用场景三：响应式
const Vue = obj => {
    return new Proxy(obj, {
        set: (target, prop, value, receiver) => {
            if (prop in target.data) {
                console.log('diff...');
                console.log('re-render...');
            }

            return true;
        },
    });
};

const vm = Vue({
    data: {
        name: 'lyreal666',
    },
});
vm.name = 'ly';

// 什么情况下 receiver 不是指向代理对象本身
proxyObj = new Proxy(
    {},
    {
        set: (target, prop, value, receiver) => {
            target[prop] = receiver;
            return true;
        },
    }
);

testObj = Object.create(proxyObj, {});
proxyObj.age = 22;
testObj.age = 18;
console.log(testObj === testObj.age); // => true

// 严格模式下 set 函数必须返回 true, 否则报错
const testStrictModelProxySet = () => {
    'use strict';

    const proxyObj = new Proxy(
        {},
        {
            set(target, prop, value, receiver) {
                target[prop] = value;
            },
        }
    );
    proxyObj.gf = '???';
};
// testStrictModelProxySet(); // TypeError: 'set' on proxy: trap returned falsish for property 'gf'
