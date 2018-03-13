var settings = require('../settings.json');

var line = function (line) {
    var self = this;
    self.id = line.id;
    self.createdAt = new Date(line.createdAt);
    self.hostName = line.hostName;
    self.type = line.type;
    self.player = line.player;
    self.text = line.text;

    if (self.host in settings.chatFormat) {
        if (matches = self.message.match(new RegExp(settings.chatFormat[self.host]['chat']['regex'], 'i'))) {
            self.player = matches[1];
            self.body = matches[2];
        }
        else if (matches = self.message.match(new RegExp(settings.chatFormat[self.host]['wisper']['regex'], 'i'))) {
            self.player = matches[1];
            self.body = matches[2];
        }
    }

    return this;
}

module.exports = line;