var lineRepository = function (mysql) {
    var settings = require('../settings.json');
    var sprintf = require('sprintf-js').sprintf
    var line = require('../models/line.js');
    var executeOnReceived = [];

    self = this;

    self.cooldownTime = 800;
    self.lastSentTime = null;
    self.lastSentMessage = '';
    self.translation = require('../lang.json');

    self.get = function (options, callback) {
        let query = 'select `id`, `created_at` as `createdAt`, `host_name` as `hostName`, `type`, `player`, `text` from `lines`';
        let params = [];

        query += ' where host_name = ?';
        params.push(options.hostName)

        if (options.upper && typeof options.upper == 'number') {
            query += ' and `id` <= ?';
            params.push(options.upper);
        }

        if (options.lower && typeof options.lower == 'number') {
            query += ' and `id` >= ?';
            params.push(options.lower);
        }

        query += ' order by `id` desc';

        query += ' limit ?';

        if (options.count && typeof options.count == 'number' && options.count <= 100) {
            params.push(options.count);
        }
        else {
            params.push(100)
        }

        mysql.query(query, params, (error, rows, fields) => {
            if (error) throw error;

            rows.forEach((row) => {
                row = line(row);
            });

            callback(error, rows, fields);
        });
    }

    self.send = function (text) {
        if (!self.canSend(text) || !self.canSendInternal(text)) throw new Error();

        self.lastSentMessage = text;
        self.lastSentTime = (new Date).getTime();
        self.onSent(text);
    }

    self.onSent = function (text) { };

    self.canSend = function (text) {
        return false;
    }

    self.canSendInternal = function (text) {
        return text != self.lastSentMessage;
    }

    self.save = function (line) {
        let query = 'insert into `lines` (`created_at`, `host_name`, `type`, `player`, `text`) values (?, ?, ?, ?, ?)';
        let params = [line.createdAt, line.hostName, line.type, line.player, line.text];
        mysql.query(query, params,
            (error, results, fields) => {
                if (error) throw error;
            });
    }

    self.receive = (hostName, msg) => {
        var l = self.parse(hostName, msg, new Date());
        executeOnReceived.forEach((callback) => callback(l));
        self.save(l);
    }

    self.onReceived = function (callback) {
        executeOnReceived.push(callback);
    }

    self.parse = function (hostName, msg, receivedTime) {
        var l = {};
        l.hostName = hostName;
        l.createdAt = receivedTime;
        l.type = 'chat';
        l.player = null
        l.text = null
        l.body = null;
        l.class = null;
        l.inline = [];

        // 拡張メッセージ
        if ('translate' in msg && 'with' in msg && msg.translate in self.translation) {
            let texts = msg.with.map((w) => {
                let parsed = self.parse(hostName, w, receivedTime);
                return parsed.text;
            });
            
            l.text = sprintf(self.translation[msg.translate], ...texts);
        }
        else if ('translate' in msg) {
            l.text = self.translation[msg.translate];
        }
        else if ('extra' in msg) {
            l.text = '';
            l.inline = msg.extra.map((e) => self.parse(hostName, e, receivedTime));

            for (var i = 0; i < l.inline.length; i++) {
                l.text += l.inline[i].text;
            }
        }
        else {
            l.text = msg.text;
        }

        // プレイヤーと本文の切り出し
        if (l.hostName in settings.chatFormat) {
            if (matches = l.text.match(new RegExp(settings.chatFormat[l.hostName]['chat']['regex'], 'i'))) {
                l.type = 'chat';
                l.player = matches[1];
                l.body = matches[2];
            }
            else if (matches = l.text.match(new RegExp(settings.chatFormat[l.hostName]['wisper']['regex'], 'i'))) {
                l.type = 'wisper';
                l.player = matches[1];
                l.body = matches[2];
            }
            else {
                l.type = 'notice';
                l.player = null;
                l.body = l.text;
            }
        }

        return l;
    };

    return this;
}

module.exports = lineRepository;