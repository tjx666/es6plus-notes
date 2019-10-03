/* disable-eslint */
/**
 * 装饰器 decorator
 */

const assert = require('assert');

// ------------------------ 修饰 class  -----------------------------
// 装饰器的本质是一个根据装饰位置接受不同参数的函数
const testable = target => {
    target.isTestable === true;
};

@testable
class TestableClass {
    // ...
}
assert.ok(new TestableClass());
