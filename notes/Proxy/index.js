/**
 * proxy 是个需要深刻理解和掌握的知识点，许多框架如 vue，mobx 等底层都使用了 proxy 进行数据拦截，依赖收集等
 * 第一次在 js 领域听到元编程这个词就是在阮一峰 ES6 的 proxy 章节，元编程-对编程语言进行编程
 */

// ----------------------- 基本使用 -----------------------------
/**
 * 使用 proxy 时我们需要通过 Proxy 构造器（一般就 new Proxy(target, handler))拿到一个 proxy 对象，
 * 对 proxy 对象的很多 js 的默认操作都会被 handler 定义的拦截器所拦截。借此，我们可以修改 js 语言的很多默认行为
 * 其实很多所谓的响应式，都可以通过 proxy 来实现
 */

const me = {
    name: 'YuTengjing',
    age: 22,
    girlFriend: '😏'
};

const meProxy = new Proxy(me, {
    get: (target, property, proxyObj) => {
        console.log(`You want to get ${property}`);
        if (property === 'girlFriend') throw new Error("It's a secret!");
        return target[property];
    },
    set: (target, property, value, proxyObj) => {
        if (['name, age, girlFriend'].includes(property))
            console.log(
                `You want to set ${property}. but no body can set my information, haha...`
            );
        else target[property] = value;
    }
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
                if (target.hasOwnProperty(property)) return target[property];
                else
                    throw new Error(
                        `The target object doesn't own the property: ${property} itself`
                    );
            }
        }
    ),
    {
        saying: {
            value: 'In me the tiger, sniffers the rose'
        }
    }
);
console.log(testObj.saying); // => In me the tiger, sniffers the rose
console.log(testObj.abc); // Error: The target object doesn't own the property: abc itself
