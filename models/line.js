var settings = require('../settings.json');

var line = function (line) {
    var self = this;
    self.id = line.id;
    self.createdAt = new Date(line.createdAt);
    self.hostName = line.hostName;
    self.type = line.type;
    self.player = line.player;
    self.text = line.text;

    switch (self.type) {
        case 'error':
            self.typeSymbol = '&#xE814;';
            break;
        case 'wisper':
            self.typeSymbol = '&#xE8BD;';
            break;
        case 'join':
            self.typeSymbol = '&#xE72A;';
            break;
        case 'leave':
            self.typeSymbol = '&#xE72B;';
            break;
        default:
            self.typeSymbol = null
    }

    return this;
}

module.exports = line;