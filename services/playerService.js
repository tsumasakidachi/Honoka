var playersRepository = function () {
    var self = this;

    self.players = [];

    self.get = function()
    {
        return self.players;
    }

    self.playersChanged = function (players) {
        self.players = players;
    }

    return self;
}

module.exports = playersRepository;