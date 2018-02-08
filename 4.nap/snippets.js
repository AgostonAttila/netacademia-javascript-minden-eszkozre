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
    }
};