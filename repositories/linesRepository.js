var settings = require("../settings.json");
var database = require("../services/database.js");
var sprintf = require("sprintf-js").sprintf
var commandOnReceived = [];
var lines = {};

lines.cooldownTime = 10000;
lines.lastSentTime = 0;
lines.lastSentMessage = "";
lines.lines = [];
lines.translation = require("../lang.json");

lines.getLatest = function (option, callback) {
    return database.lines.select(option, callback);
}

lines.parseAsync = async function (host, msg, receivedTime) {
    var l = {};
    l.host = host;
    l.createdAt = receivedTime;
    l.type = "chat";
    l.player = null
    l.body = null;
    l.class = null;
    l.inlines = [];

    if ("translate" in msg && "with" in msg && msg.translate in lines.translation) {
        var extended = await Promise.all(msg.with.map(async (w) => await lines.parseAsync(host, w, receivedTime)));
        var params = await Promise.all(extended.map(async (x) => await x.body));
        l.body = await sprintf(lines.translation[msg.translate], ...params);
    }
    else if ("translate" in msg) {
        l.body = lines.translation[msg.translate];
    }
    else if ("extra" in msg) {
        l.body = "";
        l.inlines = await Promise.all(msg.extra.map(async (e) => await lines.parseAsync(host, e, receivedTime)));

        for (var i = 0; i < l.inlines.length; i++) {
            l.body += l.inlines[i].body;
        }
    }
    else {
        l.body = msg.text;
    }

    return l;
};

lines.send = function (msg) {
    var now = (new Date).getTime();

    if (lines.canSend() && msg != lines.lastSentMessage && now > lines.lastSentTime + lines.cooldownTime) {
        lines.onSent(msg);
        lines.lastSentMessage = msg;
        lines.lastSentTime = now;
    }
}

lines.onSent = function (msg) { };

lines.canSend = function () {
    return false;
}

lines.save = function (line) {
    database.lines.insert(line);
}

lines.receiveAsync = async (host, msg) => {
    var l = await lines.parseAsync(host, msg, new Date());
    lines.save(l);
    commandOnReceived.forEach((callback) => callback(l));
}

lines.onReceived = function (callback) {
    commandOnReceived.push(callback);
}

module.exports = lines;