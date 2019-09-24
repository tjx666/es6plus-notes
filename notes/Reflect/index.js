/**
 * 反射
 * 反射的用途：
 * 1. 获取语言内部的一些方法，一些当前部署在 Object 上的属于语言内部的方法也被部署在了 Reflect 上了，如 Object.keys()，Object.defineProperty()
 * 2. 让语言的一些操作可以以函数的形式调用，更加直观和函数式，比如 in, delete 操作符可以用 Reflect.has()，Reflect.deleteProperty() 替代
 * 3. 和 Proxy 是绝配
 */

// 简单认识一下反射
const obj = {
    name: 'lyreal666',
    aaa: 'useless',
};

console.log(obj); // => { name: 'lyreal666', aaa: 'useless' }
delete obj.aaa;
console.log(obj); // => { name: 'lyreal666' }

obj.bbb = 'yayaya';
console.log(obj); // => { name: 'lyreal666', bbb: 'yayaya' }
Reflect.deleteProperty(obj, 'bbb');
console.log(obj); // => { name: 'lyreal666' }
