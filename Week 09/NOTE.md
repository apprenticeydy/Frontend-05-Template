学习笔记

继续完成第8周的 client.js


本章内容需要 npm install css  // 包用来解析css

https://whatwg.org/
HTML(超文本) 语言标准 living standard


``  值得注意的是这个符号内部是原样输出(含解析变量)  如: \r\n  的时候如果有换行就不需要 \r\n 了  , 参考week08 的client2.js 里面的header this.toString 和 week 09 里面的区别,  09是正确的



CSS的优先级
inline id class tag

如:

div .clas #id   优先级最高
[0, 1, 1, 1]

div div #id     优先级其次
[0, 1, 0, 2]

div #id
[0, 1, 0, 1]    优先级低

