const css = require('css');
const layout = require("./layout.js");
const EOF = Symbol("EOF");
let currentToken = null;
let currentAttribute = null;

let stack = [{ type: "document", chidlren: [] }];

// 全局rules 来保存收集到的 css规则
let rules = [];

function addCSSRules(text) {
    var ast = css.parse(text);
    console.log(JSON.stringify(ast, null, "    "));
    rules.push(...ast.sttlesheet.rules)
}

// 这里只是用简单选择器做例子   ,  不含复合等负责选择器 div.a#a or div[name-1]

function match(element, selector) {
    if (!selector || !element.attributes) {
        return false;
    }

    if (selector.charAt(0) == "#") {
        var attr = element.attributes.filter(attr => attr.name === 'id')[0]
        if (attr && attr.value === selector.replace('#', '')) {
            return true;
        }

    } else if (selector.charAt(0) == ".") {
        var attr = element.attributes.filter(attr => attr.name === 'class')[0]
        if (attr && attr.value === selector.replace('.', '')) {
            return true;
        }
    } else {
        if (element.tagName = selector) {
            return true;
        }
    }

    return false;
}

//找出CSS的优先级
function specificity() {
    var p = [0, 0, 0, 0];
    var selectorParts = selector.split(" ");
    for (var part of selectorParts) {
        if (part.charAt(0) == "#") {
            p[1] += 1;
        } else if (part.charAt(0) == ".") {
            p[2] += 1;
        } else {
            p[3] += 1;
        }
    }
    return p;
}

function compare(sp1, sp2) {
    if (sp1[0] - sp2[0]) {
        return sp1[0] - sp2[0];
    }

    if (sp1[1] - sp2[1]) {
        return sp1[1] - sp2[1];
    }

    if (sp1[2] - sp2[2]) {
        return sp1[2] - sp2[2];
    }

    return sp1[3] - sp2[3]
}

function computeCSS(element) {
    //console.log(rules);
    //console.log("computeCSS For Element", element);

    //slice 传空 相当于复制一个对象,  使用 reverse 颠倒顺序 达到从子元素向外匹配选择器的目的
    var elements = stack.slice().reverse();


    if (!element.computeStyle) {
        element.computeStyle = {};
    }

    for (let rule of rules) {
        //同理优先选择 选择器的最末端
        //调用match 函数进行匹配 (优先匹配首个 .clas 如: div .clas)
        var selectorParts = rule.selectors[0].slice(" ").reverse();

        if (!match(element, selectorParts[0])) {
            continue;
        }

        let matched = false;

        // 之后以此向上匹配
        //j 表示 选择器的位置,   i表示元素的位置
        var j = 1;
        for (var i = 0; i < elements.length; i++) {
            if (match(elements[i], selectorParts[j])) {
                j++;
            }
        }

        // 完全匹配后 如: div .clas 那么 父级的div 可能很多 
        // 所以 j 一定是大于等于 选择器规则的
        if (j >= selectorParts.length) {
            matched = true;
        }

        if (matched) {
            //console.log("Element:", element, "matched rule", rule);
            var sp = specificity(rule.selectors[0]);
            var computedStyle = element.computedStyle;
            for (var declaration of rule.declarations) {
                if (!computedStyle[declaration.property]) {
                    computedStyle[declaration.property] = {};
                }

                if (!computedStyle[declaration.property].specificity) {
                    computedStyle[declaration.property].value = declaration.value;
                    computedStyle[declaration.property].specificity = sp;
                } else if (compare(computedStyle[declaration.property].specificity, sp) < 0) {
                    computedStyle[declaration.property].value = declaration.value;
                    computedStyle[declaration.property].specificity = sp;
                }


            }
        }
    }
}

function emit(token) {


    let top = stack[stack.length - 1];
    if (token.type == "startTag") {
        let element = {
            type: "element",
            children: [],
            attributes: []
        };

        element.tagName = token.tagName;

        for (let p in token) {
            if (p != "type" && p != "tagName") {
                element.attributes.push({
                    name: p,
                    value: token[p]
                });
            }
        }

        computeCSS(element);

        top.chidlren.push(element);
        element.parent = top;

        if (!token.isSelfClosing)
            stack.push(element);

        currentTextNode = null;
    } else if (token.type = "endTag") {
        if (top.tagName != token.tagName) {
            throw new Error("tag start end doesnt match");
        } else {
            // 解析 css
            if (top.tagName === "style") {
                addCSSRules(top.chidlren[0].content);
            }

            layout(top);

            stack.pop();
        }
        currentTextNode = null;

    } else if (token.type == "text") {
        if (currentTextNode == null) {

            currentTextNode = {
                type: "text",
                content: ""
            }
            top.chidlren.push(currentTextNode);
        }

        currentTextNode.content += token.content
    }



}



function data(c) {
    if (c == "<") {
        return tagOpen;
    } else if (c == EOF) {
        emit({
            type: "EOF"
        });
        return;
    } else {
        emit({
            type: "text",
            content: c
        });
        return data;
    }
}

function tagOpen(c) {
    if (c == "/") {
        return endTagOpen;
    } else if (c.match(/^[a-zA-Z]$/)) {
        currentToken = {
            type: "startTag",
            tagName: ""
        };
        return tagName(c);
    } else {
        return;
    }
}

function endTagOpen(c) {
    if (c.match(/^[a-zA-Z]$/)) {
        currentToken = {
            type: "endTag",
            tagName: ""
        }
        return tagName(c);
    } else if (">") {

    } else if (c == EOF) {

    } else {

    }
}

function tagName(c) {
    if (c.match(/^[\t\n\f ]$/)) {
        return beforeAttributeName;
    } else if (c == "/") {
        return selfClosingStartTag;
    } else if (c.match(/^[a-zA-Z]$/)) {
        currentToken.tagName += c;
        return tagName;
    } else if (c == ">") {
        emit(currentToken);
        return data;
    } else {
        return tagName;
    }
}

function beforeAttributeName(c) {
    if (c.match(/^[\t\n\f ]$/)) {
        return beforeAttributeName();
    } else if (c == "/" || c == ">" || c == EOF) {

        return afterAttributeName(c);
    } else if (c == "=") {
        //return beforeAttributeName;
    } else {
        currentAttribute = {
            name: "",
            value: ""
        };
        return attributeName(c);
    }

}

function afterAttributeName(c) {
    if (c.match(/^[\t\n\f ]$/)) {
        return afterAttributeName;
    } else if (c == "/") {
        return selfClosingStartTag;
    } else if (c == '=') {
        return beforeAttributeValue;
    } else if (c == ">") {
        currentToken[currentAttribute.name] = currentAttribute.value;
        emit(currentToken);
        return data;
    } else if (c == EOF) {


    } else {
        currentToken[currentAttribute.name] = currentAttribute.value;
        currentAttribute = {
            name: "",
            value: ""
        }
        return attributeName(c);
    }
}

function attributeName(c) {
    if (c.match(/^[\t\n\f ]$/) || c == "/" || c == ">" || c == EOF) {
        return afterAttributeName(c);
    } else if (c == "=") {
        return beforeAttributeValue;
    } else if (c == "\u0000") {

    } else if (c == "\"" || c == "'" || c == "<") {

    } else {
        currentAttribute.name += c;
        return attributeName;
    }
}

function beforeAttributeValue(c) {
    if (c.match(/^[\t\n\f ]$/) || c == "/" || c == ">" || c == EOF) {
        return beforeAttributeValue;
    } else if (c == "\"") {
        return doubleQuotedAttributeValue;
    } else if (c == "'") {
        return singleQuotedAttributeValue;
    } else if (c == ">") {

    } else {
        return UnquotedAttributeValue(c);
    }
}

function doubleQuotedAttributeValue() {
    if (c == "\"") {
        currentToken[currentAttribute.name] = currentAttribute.value;
        return afterQuotedAttributeValue;
    } else if (c == "\u0000") {} else if (c == EOF) {

    } else {
        currentAttribute.value += c;
        return doubleQuotedAttributeValue;
    }
}

function singleQuotedAttributeValue() {
    if (c == "'") {
        currentToken[currentAttribute.name] = currentAttribute.value;
        return afterQuotedAttributeValue;
    } else if (c == "\u0000") {} else if (c == EOF) {

    } else {
        currentAttribute.value += c;
        return singleQuotedAttributeValue;
    }
}

function afterQuotedAttributeValue(c) {
    if (c.match(/^[\t\n\f ]$/)) {
        return beforeAttributeName;
    } else if (c == "/") {
        return selfClosingStartTag;
    } else if (c == ">") {
        currentToken[currentAttribute.name] = currentAttribute.value;
        emit(currentToken);
        return data;
    } else if (c == EOF) {} else {
        currentAttribute.value += c;

        // double 和 single 都调用了此方法,  虽然匹配的是结束 " 或者 ', 这里为什么返回到 doubleQuotedAttributeValue ?
        // 如 <div a="1" b= ...  这里a属性结束至少要有一个空格  那应该返回到 beforeAttributeValue 状态啊
        // 视频 HTML解析|处理 08:54  此处确实使用的是 doubleQuotedAttributeValue

        return doubleQuotedAttributeValue;
    }
}

function UnquotedAttributeValue(c) {
    if (c.match(/^[\t\n\f ]$/)) {
        currentToken[currentAttribute.name] = currentAttribute.value;
        return beforeAttributeName;
    } else if (c == "/") {
        currentToken[currentAttribute.name] = currentAttribute.value;
        return selfClosingStartTag;
    } else if (c == ">") {
        currentToken[currentAttribute.name] = currentAttribute.value;
        emit(currentToken);
        return data;
    } else if (c == "\u0000") {

    } else if (c == "\"" || c == "'" || c == "<" || c == "=" || c == "`") {} else if (c == EOF) {

    } else {
        currentAttribute.value += c;
        return UnquotedAttributeValue;
    }
}

function selfClosingStartTag(c) {
    if (c == ">") {
        currentToken.isSelfClosing = true;
        return data;
    } else if (c == "EOF") {

    } else {

    }

}


module.exports.parseHTML = function(html) {
    //console.log(html);
    let state = data;

    for (let c of html) {
        state = state(c);
    }
    state = state(EOF);
    return stack[0];
};