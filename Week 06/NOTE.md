学习笔记
1.html  在03 week 的基础上允许加入 () : 仅支持一级就可以了,   可以尝试再加一个 Expression

词法分析:
称之为可以匹配字符串语法的正则, 含转移符号等  如 a = "'\"\u\"";
其中 b2028 b2029 bfnrtv \x 的含义还需要查一下
(?:[^"\n\\\r\u2028\u2029]|\\(?:['"\\bfnrtv\n\r\u2028\u2029]|\r\n))|\\x[0-9a-fA-F]{2}|\\u[0-9a-fA-F]{4}\\[^0-9ux'"\\bfnrtv\n\\\r\u2028\u2029])*



#### Object in JavaScript
Data Property:
[[value]],  writable,  enumerable,  configurable

Accessor Property:
get,  set, enumerable,  configurable

#### ObjectApi Grammar:
{} .[] Object.defineProperty
Object.create / Object.setPrototypeOf/ Object.getPrototypeOf
new /class / extends
new/ function/ prototype