var settings = require("../settings.json");
var database = require("../services/database.js");
var sprintf = require("sprintf-js").sprintf
var commandOnReceived = [];
var lines = {};

lines.cooldownTime = 800;
lines.lastSentTime = 0;
lines.lastSentMessage = "";
lines.lines = [];
lines.translation = require("../lang.json");

lines.getLatest = function (option, callback) {
    database.lines.select(option, (error, rows, fields) => {
        rows.forEach((l) => {
            l.createdAt = new Date(l.createdAt);

            if (l.host in settings.chatFormat) {
                if (matches = l.message.match(new RegExp(settings.chatFormat[l.host]["chat"]["regex"], "i"))) {
                    l.player = matches[1];
                    l.body = matches[2];
                }
                else if (matches = l.message.match(new RegExp(settings.chatFormat[l.host]["wisper"]["regex"], "i"))) {
                    l.player = matches[1];
                    l.body = matches[2];
                }
            }

        });
        callback(error, rows, fields);
    });
}

lines.parseAsync = async function (host, msg, receivedTime) {
    var l = {};
    l.host = host;
    l.createdAt = receivedTime;
    l.type = "chat";
    l.player = null
    l.message = null
    l.body = null;
    l.class = null;
    l.inlines = [];

    // 拡張メッセージ
    if ("translate" in msg && "with" in msg && msg.translate in lines.translation) {
        var extended = await Promise.all(msg.with.map(async (w) => await lines.parseAsync(host, w, receivedTime)));
        var params = await Promise.all(extended.map(async (x) => await x.message));
        l.message = await sprintf(lines.translation[msg.translate], ...params);
    }
    else if ("translate" in msg) {
        l.message = lines.translation[msg.translate];
    }
    else if ("extra" in msg) {
        l.message = "";
        l.inlines = await Promise.all(msg.extra.map(async (e) => await lines.parseAsync(host, e, receivedTime)));

        for (var i = 0; i < l.inlines.length; i++) {
            l.message += l.inlines[i].message;
        }
    }
    else {
        l.message = msg.text;
    }

    // プレイヤーと本文の切り出し
    if (l.host in settings.chatFormat) {
        if (matches = l.message.match(new RegExp(settings.chatFormat[l.host]["chat"]["regex"], "i"))) {
            l.player = matches[1];
            l.body = matches[2];
        }
        else if (matches = l.message.match(new RegExp(settings.chatFormat[l.host]["wisper"]["regex"], "i"))) {
            l.player = matches[1];
            l.body = matches[2];
        }
        else {
            l.player = null;
            l.body = l.message;
        }
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