/* disable-eslint */
/**
 * 装饰器 decorator
 * 作用：
 * 1. 可以起到标记或者说注释的作用，@testable
 * 2. 可以很方便的对类和类的属性进行限制，如 @readonly
 * 3. 封装解耦的目的，想想是不是和组件很像，组件也是暴露几个 props，而装饰器是暴露几个参数，把内部逻辑封装，@connect
 */

const assert = require('assert');

// ------------------------ 修饰 class  -----------------------------
/* 
装饰器的本质是一个根据装饰位置接受不同参数的函数
@decorator
class A
等同于
A = decorator(A) || A
 */
const testable = target => {
    target.isTestable = true;
};

/**
 * 修饰 class 时，装饰器函数只接受一个参数 target
 */
@testable
class TestableClass {
    // ...
}
assert.ok(TestableClass.isTestable);

// 如果装饰器需要接受参数，可以使用闭包函
const restify = url => {
    return target => {
        target.url = url;
    };
};

@restify('/article')
class Article {}

console.log(Article.url); // => /article

// 如果想修改实例属性，可以设置类的 prototype
const mixin = (...list) => {
    return target => {
        Object.assign(target.prototype, ...list);
    };
};

const helloObj = {
    hello() {
        console.log('hello');
    },
};

@mixin(helloObj)
class Person {}
new Person().hello();

// 如何修改实例属性？ 貌似 target.prototype.constructor 只是指向了 constructor，使用 new 调用的海事原来的 constructor
const uuid = (function() {
    let uuid = 0;
    return target => {
        const oldConstructor = target.prototype.constructor;
        target.prototype.constructor = function(...args) {
            this.uuid = ++uuid;
            return Reflect.apply(oldConstructor, this, args);
        };
    };
})();

@uuid
class Product {}
console.log(new Product()); // => {}

// 实现 react-redux 库的 connect 装饰器
const connect = (mapStateToProps, mapDispatchToProps) => {
    return target => {
        Object.assign(target, { mapStateToProps, mapDispatchToProps });
    };
};

// ------------------------  修饰 class 属性 -----------------------------
const readonly = (prototype, prop, descriptor) => {
    return { ...descriptor, writable: false };
};

const nonenumerable = (prototype, prop, descriptor) => {
    return { ...descriptor, enumerable: false };
};

// 类的方法默认就是不可遍历的
class Good {
    @readonly
    @nonenumerable
    constName;
    type = 'Good';

    @readonly
    equals() {}

    @nonenumerable
    get kidCount() {
        return this.children.length;
    }
}

const good = new Good();
// good.name = 'ly'; // => TypeError: Cannot assign to read only property 'name' of object '#<Good>'
console.log('kidCount' in good); // true

// log 装饰器，调用函数时会输出调用日志
const log = (prototype, prop, descriptor) => {
    const oldFunc = descriptor.value;
    return {
        ...descriptor,
        value: function(...args) {
            console.log(`Call function: ${prop}...`);
            return Reflect.apply(oldFunc, this, args);
        },
    };
};

class Worker {
    @log
    work() {
        console.log('摸鱼...');
    }
}

new Worker().work();
// =>
// Call function: work...
// 摸鱼...

// 装饰器的执行顺序
const decoratorA = () => {
    console.log('A enter');

    return target => {
        console.log('A execute');
    };
};

const decoratorB = () => {
    console.log('B enter');

    return target => {
        console.log('B execute');
    };
};

const decoratorC = () => {
    console.log('C enter');

    return target => {
        console.log('C execute');
    };
};

@decoratorA()
@decoratorB()
@decoratorC()
class TestDecoratorExecuteOrder {}
/* 像剥洋葱一样，先由外到内生成所有装饰器，再从最里面的装饰器执行到外 
A enter
B enter
C enter
C execute
B execute
A execute
 */

// ------------------------ 装饰器不能装饰函数 -----------------------------
/* 
var someDecorator = require('decorator-lib');

// eslint: Parsing error: Leading decorators must be attached to a class declaration
@someDecorator
function func() {
    // ...
}

// 上面代码真实执行情况是
var someDecorator;

@someDecorator
function func() {
    // ...
}

someDecorator = require('decorator-lib');
// 主要还是因为使用装饰器修饰 function 声明的函数是非常常见的，而因为 function 声明的函数会被提升到作用域顶部，很可能装饰器本身都没定义
 */
