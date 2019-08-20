/* eslint-disable no-undef */
/**
 * proxy 是个需要深刻理解和掌握的知识点，许多框架如 vue，mobx 等底层都使用了 proxy 进行数据拦截，依赖收集等
 * vue3 将使用 proxy 代替 Object.define，旨在提高性能和带来更多扩展性
 * 第一次在 js 领域听到元编程这个词就是在阮一峰 ES6 的 proxy 章节，元编程-对编程语言进行编程
 */

// ----------------------- 基本使用 -----------------------------
/**
 * 使用 proxy 时我们需要通过 Proxy 构造器（一般就 new Proxy(target, handler))拿到一个 proxy 对象，
 * 对 proxy 对象的很多 js 的默认操作都会被 handler 定义的拦截器所拦截。借此，我们可以修改 js 语言的很多默认行为
 * 其实很多所谓的响应式，都可以通过 proxy 来实现
 */
const util = require('util');

const me = {
    name: 'YuTengjing',
    age: 22,
    girlFriend: '😏',
};

const meProxy = new Proxy(me, {
    get: (target, property, proxyObj) => {
        // console.log(property);
        // console.log(`You want to get ${property}`);
        // eslint-disable-next-line quotes
        if (property === 'girlFriend') throw new Error("It's a secret!");
        return target[property];
    },
    set: (target, property, value, proxyObj) => {
        if (['name, age, girlFriend'].includes(property)) {
            console.log(`You want to set ${property}. but no body can set my information, haha...`);
        } else {
            target[property] = value;
        }
    },
});

// 要想设置的拦截器起作用，我们需要对返回的 proxy 对象操作而不是原对象
console.log(me.name); // => YuTengjing
console.log(me.girlFriend); // => 😏

console.log(meProxy.name);
// You want to get name
// YuTengjing
// console.log(meProxy.girlFriend);
// You want to get girlFriend
// Error: It's a secret!

meProxy.age = 21; // You want to set age. but no body can set my information, haha...
console.log(meProxy.age);
// 22
// You want to get age

// 将代理对象设置为一个属性
me.proxy = meProxy;
console.log(me.proxy.name);
// You want to get name
// YuTengjing

// 将代理设置为原型
const testObj = Object.create(
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
    // eslint-disable-next-line quotes
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

const proxyObj = new Proxy(
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
