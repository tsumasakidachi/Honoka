var lineRepository = function (mysql) {
    let settings = require('../settings.json');
    let sprintf = require('sprintf-js').sprintf
    let executeOnReceived = [];

    self = this;
    self.cooldownTime = 5000;
    self.lastSentTime = null;
    self.lastSentMessage = '';
    self.translation = require('../lang.json');

    self.getAsync = function (options) {
        let p = new Promise((resolve, reject) => {
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

            if (options.count && typeof options.count == 'number' && options.count <= 1000) {
                params.push(options.count);
            }
            else {
                params.push(1000)
            }

            mysql.query(query, params, (error, rows, fields) => {
                if (error) reject(error);

                rows = rows.reverse();
                resolve(rows);
            });
        });

        return p;
    }

    self.countDiurnalAsync = function () {
        let p = new Promise((resolve, reject) => {
            let query = 'select date(`created_at`) as `date`, count(*) as `count` from `lines` group by `date`;';

            mysql.query(query, [], (error, rows, fields) => {
                if (error) reject(error);

                resolve(rows);
            });
        });

        return p;
    }

    self.send = function (text, mode = 'programmatically') {
        if (!self.canSend(text) || !self.canSendInternal(text, mode)) throw new Error();

        self.onSent(text);

        if (mode == 'programmatically') {
            self.lastSentMessage = text;
            self.lastSentTime = new Date();
        }
    }

    self.onSent = function (text) { };

    self.canSend = function (text) {
        return false;
    }

    self.canSendInternal = function (text, mode) {
        if (self.lastSentTime == null) return true;

        let elapsed = (new Date()).getTime() - self.lastSentTime.getTime();

        return mode != 'programmatically' || elapsed > self.cooldownTime;
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
        let line = self.parse(hostName, msg, new Date());
        self.save(line);

        for (let i = 0; i < executeOnReceived.length; i++) {
            executeOnReceived[i](line);
        }
    }

    self.onReceived = function (callback) {
        executeOnReceived.push(callback);
    }

    self.parse = function (hostName, msg, receivedTime) {
        let l = {};
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

            for (let i = 0; i < l.inline.length; i++) {
                l.text += l.inline[i].text;
            }
        }
        else {
            l.text = msg.text;
        }

        // プレイヤーと本文の切り出し
        if (settings.chatFormat[l.hostName]['chat'] && (matches = l.text.match(new RegExp(settings.chatFormat[l.hostName]['chat'], 'i')))) {
            l.type = 'chat';
            l.player = matches[1];
            l.body = matches[2];
        }
        else if (settings.chatFormat[l.hostName]['chat'] && (matches = l.text.match(new RegExp(settings.chatFormat[l.hostName]['wisper'], 'i')))) {
            l.type = 'wisper';
            l.player = matches[1];
            l.body = matches[2];
        }
        else if (settings.chatFormat[l.hostName]['join'] && (matches = l.text.match(new RegExp(settings.chatFormat[l.hostName]['join'], 'i')))) {
            l.type = 'join';
            l.player = matches[1];
        }
        else if (settings.chatFormat[l.hostName]['leave'] && (matches = l.text.match(new RegExp(settings.chatFormat[l.hostName]['leave'], 'i')))) {
            l.type = 'leave';
            l.player = matches[1];
        }
        else {
            l.type = 'notice';
            l.player = null;
            l.body = l.text;
        }

        return l;
    };

    return this;
}

module.exports = lineRepository;