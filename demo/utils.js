function $(selector, selectAll, owner){
    owner = owner || document;
    return selectAll ? owner.querySelectorAll(selector) : owner.querySelector(selector);
}

function addClass(elem, className){
    var names = elem.className.split(' ');
    if(names.indexOf(className) == -1){
        names.push(className);
        elem.className = names.join(' ');
    }
}

function removeClass(elem, className){
    var names = elem.className.split(' ');
    var index = names.indexOf(className);
    if(index != -1){
        names.splice(index, 1);
        elem.className = names.join(' ');
    }
}

function hasClass(elem, className){
    var names = elem.className.split(' ');
    var index = names.indexOf(className);
    return index > -1;
}

function template(text, data){
    var escapes = {
        "'":      "'",
        '\\':     '\\',
        '\r':     'r',
        '\n':     'n',
        '\t':     't',
        '\u2028': 'u2028',
        '\u2029': 'u2029'
    };
    var escaper = /'|\\|\r|\n|\t|\u2028|\u2029/g;
    var entityRegexes = /[&<>"']/g;
    var matcher = /<%-([\s\S]+?)%>|<%=([\s\S]+?)%>|<%([\s\S]+?)%>|$/g; // escape、interpolate、evaluate
    var index = 0;
    var source = "__p+='";
    var render;

    function escapeEntity(string) {
        if (!string) {
            return '';
        }
        var entityMap = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&apos;'
        };
        return ('' + string).replace(/[&<>"']/g, function(match) {
            return entityMap[match];
        });
    }

    text.replace(matcher, function(match, escape, interpolate, evaluate, offset) {
        // HTML部分（index到offset）
        source += text.slice(index, offset).replace(escaper, function(match) {
            return '\\' + escapes[match];
        });
        // 变量值或js代码（offset之后）
        if (escape) { // 变量值，并进行HTML实体转义
            source += "'+\n((__t=(" + escape + "))==null?'':" + escapeEntity.name + "(__t))+\n'";
        }
        if (interpolate) { // 变量值
            source += "'+\n((__t=(" + interpolate + "))==null?'':__t)+\n'";
        }
        if (evaluate) { // js代码
            source += "';\n" + evaluate + "\n__p+='";
        }
        index = offset + match.length;
        return match;
    });
    source += "';\n";

    source = 'with(obj||{}){\n' + source + '}\n'; // 使用with获取传入的data的属性

    source = escapeEntity.toString() + // HTML实体转义函数
        "var __t,__p='',__j=Array.prototype.join," + // source是编译后的函数代码。“__t”是局部变量，用于获取变量的值。"__p"用于拼接模板
        "print=function(){__p+=__j.call(arguments,'');};\n" + // print函数用于打印带有常量字符串的变量值。使用Array.prototype.join把print内的参数变成字符串
        source + "return __p;\n";

    try { // 使用try-catch，出错后方便调试
        render = new Function('obj', source); // 使用new Function创建编译后的函数，this指向window
    } catch (e) {
        e.source = source;
        throw e;
    }

    if (data) return render(data); // 如果传递了data，则返回编译后的模板
    var template = function(data) { // 预编译函数
        return render(data);
    };

    template.source = 'function(obj){\n' + source + '}'; // 可以使用source属性查看编译后的函数，方便调试

    return template; // 如果没有传递data，则返回预编译函数
}