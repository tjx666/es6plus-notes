### ECMAScript 和 Javascript 的关系？

ECMAScript 是 Javascript 的规格，个人理解就是规范。Javascript 是 ECMAScript 的一种实现，一种方言？

### 为什么有没有 ES4?

因为这个版本太激进了，对 ES3 做了彻底升级，导致标准委员会的一些成员不愿意接受。

以 Yahoo、Microsoft、Google 为首的大公司，反对 JavaScript 的大幅升级，主张小幅改动；以 JavaScript 创造者 Brendan Eich 为首的 Mozilla 公司，则坚持当前的草案。

由于对于下一个版本应该包括哪些功能，各方分歧太大，争论过于激烈，ECMA 开会决定，中止 ECMAScript 4.0 的开发，将其中涉及现有功能改善的一小部分，发布为 ECMAScript 3.1，而将其他激进的设想扩大范围，放入以后的版本，由于会议的气氛，该版本的项目代号起名为 Harmony（和谐）。会后不久，ECMAScript 3.1 就改名为 ECMAScript 5。

### 怎样解决 ES6 不支持的问题？

之前面试阿里实习的时候，二面的女面试官就问了这个问题。这其实是两个问题：

1. ES6 语法
2. ES6 API

#### babel

使用 babel 编译器转码，babel 不但提供了将 ES6 转码成 ES5 甚至 ES3 等更低版本的 ECMAScript，还可以通过 babel-polyfill 为当前运行环境提供 ES6 API。

Babel 也可以用于浏览器环境，使用[@babel/standalone](https://babeljs.io/docs/en/next/babel-standalone.html)模块提供的浏览器版本，将其插入网页。注意，网页实时将 ES6 代码转为 ES5，对性能会有影响。生产环境需要加载已经转码完成的脚本。

#### Traceur

Google 公司开源的一个转码器。支持浏览器环境引入 script 脚本转码，也支持作为 node 模块来转码 js 文件。

#### Typescript

使用 javascript 的中间语言即可。

官方原文：

> TypeScript compiles to clean, simple JavaScript code which runs on any browser, in Node.js, or in any JavaScript engine that supports ECMAScript 3 (or newer).

### 怎样查看 ES6 的支持度？

[ES-Checker](https://github.com/ruanyf/es-checker)，用来检查各种运行环境对 ES6 的支持情况。访问 [ruanyf.github.io/es-checker](http://ruanyf.github.io/es-checker)，可以看到您的浏览器支持 ES6 的程度。

### ECMAScript 的提案的批准流程？

-   Stage 0 - Strawman（展示阶段）
-   Stage 1 - Proposal（征求意见阶段）
-   Stage 2 - Draft（草案阶段）
-   Stage 3 - Candidate（候选人阶段）
-   Stage 4 - Finished（定案阶段）

一个提案只要能进入 Stage 2，就差不多肯定会包括在以后的正式标准里面。ECMAScript 当前的所有提案，可以在 TC39 的官方网站[GitHub.com/tc39/ecma262](https://github.com/tc39/ecma262)查看。

### ES6 和 ES7, ES8 的关系？

参考：[ES7 是正式的称呼吗？](https://www.zhihu.com/question/55753611?utm_source=qq&utm_medium=social&utm_oi=793248355764539392)

个人理解：ES6 **狭义**指 ECMAScript 2015。**广义**指 ECMAScript 往后的的标准，即 ECMAScript 2015，ECMAScript 2016，ECMAScript 2017 等往后的都可以称为 ES6，因为 ES6 有时候被认为是下一代 javascript。

ES7 指的是 ECMAScript 2016

ES8 指的是 ECMAScript 2017

结论：ES(x+1) 指的是 ECMAScript 201x。
