var express = require('express'),
    path = require("path");

var app = express();

app.get('/something', function (req, res) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type');

    res.send({ status: "ok", message: "Itt egy adag valami!" });
});

app.get('/somethingElse', function (req, res) {
    res.send({ status: "ok", message: "Itt egy adag másik valami!" });
});

var port = process.env.PORT || 2222;
app.listen(port);
console.log("Figyelek!");