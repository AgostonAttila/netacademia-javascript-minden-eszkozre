var huf, HUF = huf = (function () {
    var methods = {
        html: function (val) {
            if (arguments.length) {
                this.innerHTML = val;
            }
            else {
                return this.innerHTML;
            }
        },

        text: function (val) {
            var propName = (!!this.innerText ? "innerText" : "textContent");

            if (arguments.length) {
                this[propName] = val;
            }
            else {
                return this[propName];
            }
        },

        height: function (height) {
            if (arguments.length) {
                this.style.height = utils.addDefaultUnit(height);
            } else {
                return utils.removeUnit(utils.getStyle(this, "height"));
            }
        },

        width: function (width) {
            if (arguments.length) {
                this.style.width = utils.addDefaultUnit(width);
            } else {
                return utils.removeUnit(utils.getStyle(this, "width"));
            }
        },

        attr: function (name, val) {
            if (arguments.length > 1) {
                this.setAttribute(name, val);
            }
            else {
                return this.getAttribute(name);
            }
        },

        css: function (name, val) {
            if (arguments.length > 1) {
                this.style[name] = val;
            }
            else {
                return this.style[name];
            }
        },

        val: function (val) {
            var propName = (this.type === "checkbox" || this.type == "radio" ? "checked" : "value");

            if (arguments.length) {
                this[propName] = val;
            }
            else {
                return this[propName];
            }
        },

        on: function (eventName, handler, capture) {
            if (capture === undefined) capture = false;

            this.addEventListener(eventName, handler, capture);
        },

        off: function (eventName, handler) {
            this.removeEventListener(eventName, handler);
        },

        data: function (key, value) {
            if (arguments.length > 1) {
                if (typeof value === "string") {
                    this.setAttribute("data-" + key, value);
                }
                else {
                    this[key] = value;
                }
            }
            else {
                return this.getAttribute("data-" + key) || this[key];
            }
        },

        append: function (content) {
            var nodes = select(content);

            for (var i = 0; i < nodes.length; i++) {
                this.appendChild(nodes[i]);
            }
        },

        prepend: function (content) {
            var nodes = select(content);

            for (var i = 0; i < nodes.length; i++) {
                this.insertBefore(nodes[i], this.firstChild);
            }
        },

        appendTo: function (selector) {
            var target = select(selector);

            target[0].appendChild(this);
        },

        prependTo: function (selector) {
            var target = select(selector);

            target[0].insertBefore(this, target[0].firstChild);
        },

        find: function (selector) {
            var result = [];

            for (var i = 0; i < this.length; i++) {
                result = result.concat(utils.toArray(this[i].querySelectorAll(selector)));
            }

            return select(result);
        },

        closest: function (selector) {
            var current = this;

            while(!utils.matchesSelector(current, selector)) {
                if(current.parentElement === null) return select(null);

                current = current.parentElement;
            }

            return select(current);
        },

        animate: function (properties, duration, completed) {
            if (duration) {
                if (typeof duration === "function") {
                    completed = duration;
                    duration = select.config.animationDuration["normal"];
                }
                else if (typeof duration === "string") {
                    duration = select.config.animationDuration[duration];
                }
            }
            else {
                duration = select.config.animationDuration["normal"];
            }

            var time = 0,
                percent = 0,
                context = this,
                props = [], prop;

            var start;
            for (var key in properties) {
                if (!properties.hasOwnProperty(key)) continue;

                start = +context.style[key].replace("px", "");

                props.push({
                    name: key,
                    start: start,
                    delta: properties[key] - start
                });
            }

            var timer = window.setInterval(function () {
                time += select.config.animationInterval;
                percent = Math.min(1, time / duration);

                for (var i = 0; i < props.length; i++) {
                    prop = props[i];
                    context.style[prop.name] = (prop.start + (prop.delta * percent)) + "px";
                }

                if (percent === 1) {
                    window.clearInterval(timer);
                    (completed || select.noop).call(context);
                }
            },
            select.config.animationInterval);
        }
    };

    var utils = {
        toArray: function (what) {
            var arr = [];
            for (var i = 0, l = arr.length = what.length; i < l; i++) {
                arr[i] = what[i];
            }
            return arr;
        },

        extend: function (obj1, obj2) {
            for (var key in obj2) {
                if (!obj2.hasOwnProperty(key)) continue;

                obj1[key] = obj2[key];
            }
        },

        matchesSelector: function (element, selector) {
            var nodeList = utils.toArray(document.querySelectorAll(selector));

            for (var i = 0; i < nodeList.length; i++) {
                if (nodeList[i] === element) {
                    return true;
                }
            }

            return false;
        },

        getStyle: function (element, cssprop) {
            if (element.currentStyle) //IE
                return element.currentStyle[cssprop]
            else if (document.defaultView && document.defaultView.getComputedStyle) //Firefox
                return document.defaultView.getComputedStyle(element, "")[cssprop]
            else //try and get inline style
                return element.style[cssprop]
        },

        removeUnit: function (value) {
            return +(value.replace("px", ""));
        },

        addDefaultUnit: function (value) {
            if (+value == value) return value + "px";
            else return value;
        },

        parseHtml: function (text) {
            var tags = [], tag, context,
                mainContext = context = document.createElement("body");

            var c,
                tagName = "",
                attrName = "",
                attrValue = "",
                commentValue = "",
                attrValueMarker = "",
                textValue = "",
                isClosing = false,
                isEnd = false,
                state = "";

            for (var i = 0; i < text.length; i++) {
                c = text[i];

                if (state === "tag-name") {
                    if (c === "!") {
                        if (text[c + 1] === text[c + 2] === "-") {
                            state = "comment";
                        }
                        else {
                            throw "DOM Exception: Invalid tag name (Is it a comment?).";
                        }
                    }
                    else if (c === "/") {
                        if (tagName) {
                            state = "text";
                        }
                        else {
                            isEnd = true;
                            isClosing = true;
                        }
                    }
                    else if (c === ">") {
                        if (!isEnd) {
                            if (!tag) {
                                tag = document.createElement(tagName);
                            }

                            context.appendChild(tag);
                            textValue = "";

                            if (!isClosing) {
                                //Change level.
                                context = tag;
                            }
                        }
                        else {
                            context = context.parentNode;
                            textValue = "";

                            if (!context) break;
                        }

                        tag = undefined;
                        tagName = "";
                        isClosing = false;
                        isEnd = false;
                        state = "text";

                        continue;
                    }
                    else {
                        if (c === " ") {
                            if (!tagName) {
                                state = "text";
                            }
                            else {
                                if (!isEnd) {
                                    tag = document.createElement(tagName);
                                }

                                state = "tag";
                            }
                        }
                        else {
                            tagName += c;
                        }
                    }
                }
                else if (state === "comment") {
                    if (c === "-") {
                        if (text[c + 1] === "-" && text[c + 2] === ">") {
                            //End of comment.
                            context.appendChild(document.createComment(commentValue));

                            commentValue = "";
                            state = "text";

                            i += 3;
                            continue;
                        }
                        else {
                            commentValue += c;
                        }
                    }
                }
                else if (state === "tag") {
                    if (c === "<") {
                        //Parsed text as tag incidentally.
                        //TODO: Process as text.
                        state = "text";
                    }
                    else {
                        if (c === " ") {
                            //Nothing to do...
                        }
                        else if (c === "/") {
                            isClosing = true;
                        }
                        else if (c === ">") {
                            context.appendChild(tag);
                            textValue = "";

                            if (!isClosing) {
                                //Change level.
                                context = tag;
                            }

                            tag = undefined;
                            tagName = "";
                            isClosing = false;
                            isEnd = false;
                            state = "text";

                            continue;
                        }
                        else if (c === "=") {
                            if (attrName) {
                                state = "attr-value";
                            }
                            else {
                                //Text parsed as tag incidentally...
                                state = "text";
                            }
                        }
                        else {
                            attrName += c;
                            state = "attr-name";
                        }
                    }
                }
                else if (state === "attr-name") {
                    if (c === "=") {
                        state = "attr-value";
                    }
                    else if (c === " ") {
                        tag.setAttribute(attrName, attrName);

                        state = "tag";
                    }
                    else {
                        attrName += c;
                    }
                }
                else if (state === "attr-value") {
                    if (c === " ") {
                        if (attrValueMarker) {
                            attrValue += " ";
                        }
                        else {
                            //Nothing to do...
                        }
                    }
                    else if (c === "'" || c === '"') {
                        if (attrValueMarker) {
                            if (attrValueMarker === c) {
                                tag.setAttribute(attrName, attrValue);

                                state = "tag";
                                attrName = "";
                                attrValue = "";
                                attrValueMarker = "";
                            }
                            else {
                                attrValue += c;
                            }
                        }
                        else {
                            attrValueMarker = c;
                        }
                    }
                    else {
                        attrValue += c;
                    }
                }
                else {
                    if (c === "<") {
                        if (textValue) {
                            context.innerHTML += textValue;
                        }
                        state = "tag-name";
                    }
                }

                textValue += c;
            }

            if (state === "text") {
                if (textValue) {
                    context.innerHTML += textValue;
                }
            }

            return mainContext.childNodes;
        },

        first: function (context, method) {
            return function () {
                var result = undefined;

                if(context.length > 0) {
                    result = methods[method].apply(context[0], arguments);
                }

                return (result !== undefined ? result : context);
            }
        },

        all: function (context, method) {
            return function () {
                for (var i = 0; i < context.length; i++) {
                    methods[method].apply(context[i], arguments);
                }

                return context;
            }
        },

        getFirstSetAll: function (context, methodName) {
            var method = methods[methodName];

            return function () {
                if (context.length > 0) {
                    var args = utils.toArray(arguments);

                    if (args.length === method.length) {
                        for (var i = 0; i < context.length; i++) {
                            method.apply(context[i], args);
                        }

                        return context;
                    }
                    else {
                        return method.apply(context[0], args);
                    }
                }
            }
        },

        getFirstSetAllWithObjectSupport: function (context, methodName) {
            var method = methods[methodName];

            return function () {

                if (context.length > 0) {
                    var args = utils.toArray(arguments);

                    if (typeof args[0] === "object") {
                        for (var key in args[0]) {
                            if (!args[0].hasOwnProperty(key)) continue;

                            for (var i = 0; i < context.length; i++) {
                                method.apply(context[i], [key, args[0][key]]);
                            }
                        }

                        return context;
                    }
                    else if (args.length === method.length) {
                        for (var i = 0; i < context.length; i++) {
                            method.apply(context[i], args);
                        }

                        return context;
                    }
                    else {
                        return method.apply(context[0], args);
                    }
                }
            }
        },

        addEventAlias: function (context, name) {
            context[name] = function (handler) {
                return context.on(name, handler);
            }
        }
    };

    var eventAliases = "click dblclick".split(" ");

    var fn = {};

    var instance = function () {
        this.html = utils.getFirstSetAll(this, "html");
        this.text = utils.getFirstSetAll(this, "text");
        this.height = utils.getFirstSetAll(this, "height");
        this.width = utils.getFirstSetAll(this, "width");
        this.attr = utils.getFirstSetAllWithObjectSupport(this, "attr");

        this.css = utils.getFirstSetAllWithObjectSupport(this, "css");
        this.val = utils.getFirstSetAll(this, "val");

        this.on = utils.all(this, "on");
        this.off = utils.all(this, "off");

        this.data = utils.getFirstSetAll(this, "data");

        this.append = utils.all(this, "append");
        this.prepend = utils.all(this, "prepend");

        this.appendTo = utils.first(this, "appendTo");
        this.prependTo = utils.first(this, "prependTo");

        this.find = function (selector) {
            return methods.find.call(this, selector);
        }

        this.closest = utils.first(this, "closest");

        this.animate = utils.all(this, "animate");

        this.each = function (iterator) {
            for (var i = 0; i < this.length; i++) {
                iterator.apply(this[i], [i, this[i]]);
            }

            return this;
        };
        
        for (var i = 0; i < eventAliases.length; i++) {
            utils.addEventAlias(this, eventAliases[i])
        }
    };

    function select(selector) {
        var nodeArray = [];

        if (selector === null ||
            selector === undefined ||
            (typeof selector !== "string" &&
                typeof  selector !== "object")) {
            nodeArray = [];
        }
        else if (typeof selector === "string") {
            if (selector.trim()[0] === "<") {
                nodeArray = utils.toArray(utils.parseHtml(selector));
            }
            else {
                nodeArray = utils.toArray(document.querySelectorAll(selector));
            }
        }
        else if (selector instanceof NodeList) {
            nodeArray = utils.toArray(selector);
        }
        else if (selector instanceof Node) {
            nodeArray = [selector];
        }
        else if (selector instanceof instance) {
            return selector;
        }
        else if (selector.length) {
            nodeArray = selector;
        }
        else if (selector === window) {
            nodeArray = [window];
        }
        else {
            nodeArray = [];
        }

        instance.prototype = nodeArray;
        utils.extend(instance.prototype, fn);

        return new instance;
    }

    select.fn = fn;

    select.noop = function () { };


    var _ajax = {

        xhr: function () {
            if (window.XMLHttpRequest) {
                return new XMLHttpRequest();
            }
            else if (window.ActiveXObject) {
                return new ActiveXObject("Microsoft.XMLHTTP");
            }
            else {
                throw "Nincs AJAX.";
            }
        },

        defaultOpts: {
            done: select.noop,
            fail: select.noop,
            always: select.noop,

            statusCode: {},

            headers: [],
            contentType: "application/x-www-form-urlencoded; charset=UTF-8",
            type: "GET",
            async: true,
            username: "",
            password: "",

            context: null,

            data: null,
            processData: true,

            dataType: "guess"
        },

        extendOpts: function (opts) {
            for (var key in _ajax.defaultOpts) {
                if (!_ajax.defaultOpts.hasOwnProperty(key)) continue;
                if (opts[key]) continue;

                opts[key] = _ajax.defaultOpts[key];
            }
            return opts;
        },

        argsToOpts: function () {
            var opts = {};

            if (arguments.length === 1) {
                if (typeof arguments[0] === "string") {
                    opts.url = arguments[0];
                }
                else {
                    opts = arguments[0];
                }
            }
            else if (arguments.length >= 2) {
                opts = arguments[1];
                opts.url = arguments[0];
            }
            else {
                throw "Túl kevés paraméter!";
            }

            opts = _ajax.extendOpts(opts);

            if (opts.method) {
                opts.type = opts.method;
                delete opts.method;
            }

            if (opts.user) {
                opts.username = opts.user;
                delete opts.user;
            }

            opts.type = opts.type.toUpperCase();

            return opts;
        },

        processData: function (data) {
            var query = "";

            for (var key in data) {
                if (!data.hasOwnProperty(key)) continue;
                query += "&" + encodeURIComponent(key) + "=" + encodeURIComponent(data[key].toString());
            }

            if (query) {
                query = query.substring(1);
            }

            return query;
        },

        guessType: function (xhr) {
            var contentType = xhr.getResponseHeader("content-type").toLowerCase();

            if (contentType.indexOf("xml") !== -1) {
                return "xml";
            }
            else if (contentType.indexOf("json") !== -1) {
                return "json";
            }
            else if (contentType.indexOf("html") !== -1) {
                return "html";
            }
            else {
                return "text";
            }
        },

        processResponse: function (xhr, dataType) {
            if (!dataType || dataType === "guess") {
                dataType = _ajax.guessType(xhr);
            }

            switch (dataType) {
                case "text":
                case "html":
                default:
                    return xhr.responseText;

                case "xml":
                    return xhr.responseXML || xhr.responseXml;

                case "json":
                    return JSON.parse(xhr.responseText);
            }
        },

        shorthandArgsToOpts: function () {
            var opts = {
                url: arguments[0]
            };

            if (arguments[1]) {
                if (typeof arguments[1] === "function") {
                    opts.done = arguments[1];

                    if (arguments[2]) {
                        opts.dataType = arguments[2];
                    }
                }
                else if (["guess", "json", "xml", "html", "text"].indexOf(arguments[1]) !== -1) {
                    opts.dataType = arguments[1];
                }
                else {
                    opts.data = arguments[1];

                    if (arguments[2]) {
                        if (typeof arguments[2] === "function") {
                            opts.done = arguments[2];

                            if (arguments[3]) {
                                opts.dataType = arguments[3];
                            }
                        }
                        else if (["guess", "json", "xml", "html", "text"].indexOf(arguments[2]) !== -1) {
                            opts.dataType = arguments[2];
                        }
                    }
                }
            }

            return opts;
        },

        intelligentCallback: function() {
            var handlers = [];

            var ic = function(callback) {
                if(arguments.length && typeof callback === "function") {
                    for (var i = 0; i < arguments.length; i++) {
                        handlers.push(arguments[i]);
                    }
                }
                else {
                    for (var i = 0; i < handlers.length; i++) {
                        handlers[i].apply(this, arguments);
                    }
                }

                return this;
            };

            if(arguments.length) {
                ic.apply(this, arguments);
            }

            return ic;
        },

        promise: function (xhr, opts) {
            xhr.done = xhr.success = _ajax.intelligentCallback(opts.done);
            xhr.fail = xhr.error = _ajax.intelligentCallback(opts.fail);
            xhr.always = _ajax.intelligentCallback(opts.always);
            xhr.then = _ajax.intelligentCallback(select.noop);

            return xhr;
        }
    };

    select.ajax = function () {
        var opts = _ajax.argsToOpts.apply(this, arguments);
        var xhr = _ajax.xhr();
        var promise = _ajax.promise(xhr, opts);

        if (!opts.context) {
            opts.context = promise;
        }

        if (opts.processData && opts.data) {
            opts.data = _ajax.processData(opts.data);
        }

        if (opts.type === "GET" && opts.data) {

            if (opts.url.indexOf("?") !== -1) {
                opts.url += "&" + opts.data;
            }
            else {
                opts.url = "?" + opts.data;
            }

        }

        xhr.open(opts.type,
                 opts.url,
                 opts.async,
                 opts.username,
                 opts.password);

        xhr.setRequestHeader("content-type", opts.contentType);

        for (var key in opts.headers) {
            if (!opts.headers.hasOwnProperty(key)) continue;
            xhr.setRequestHeader(key, opts.headers[key]);
        }

        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4) {
                var statusCallback = opts.statusCode[xhr.status] ||
                                     opts.statusCode[xhr.status.toString()];

                if (statusCallback) {
                    statusCallback.call(opts.context, promise);
                }

                if (xhr.status === 200 || xhr.status === 201) {
                    var data = _ajax.processResponse(xhr, opts.dataType);
                    promise.done.call(opts.context, data, promise);
                }
                else {
                    promise.fail.call(opts.context, promise);
                }

                promise.always.call(opts.context, promise);
                promise.then.call(opts.context, promise);
            }
        };

        if (opts.type !== "GET" && opts.data) {
            xhr.send(opts.data);
        }
        else {
            xhr.send();
        }

        return promise;
    }

    select.get = function () {
        var opts = _ajax.shorthandArgsToOpts.apply(this, arguments);
        opts.type = "GET";

        return select.ajax(opts);
    };

    select.post = function () {
        var opts = _ajax.shorthandArgsToOpts.apply(this, arguments);
        opts.type = "POST";

        return select.ajax(opts);
    };

    select.put = function () {
        var opts = _ajax.shorthandArgsToOpts.apply(this, arguments);
        opts.type = "PUT";

        return select.ajax(opts);
    };

    select.delete = function () {
        var opts = _ajax.shorthandArgsToOpts.apply(this, arguments);
        opts.type = "DELETE";

        return select.ajax(opts);
    };

    select.config = {
        animationInterval: 10,

        animationDuration: {
            fast: 200,
            normal: 400,
            slow: 600
        }
    };

    return select;
})();
