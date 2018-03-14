var settings = require('../settings.json');

var line = function (line) {
    var self = this;
    self.id = line.id;
    self.createdAt = new Date(line.createdAt);
    self.hostName = line.hostName;
    self.type = line.type;
    self.player = line.player;
    self.text = line.text;

    return this;
}

module.exports = line;