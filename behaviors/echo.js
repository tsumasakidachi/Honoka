var lines = require("../repositories/linesRepository.js");

module.exports = (bot) => {
    var echo = {};

    echo.received = (l) => {
        if (l.player == bot.username) return;
        
        // if(result = l.body.match(/^\[[^\[\]]+\]<(\w+)>\s+)?$/i))
        if (result = l.body.match(/bot/i)) {
            lines.send("BOTだよ！");
        }
    };

    lines.onReceived(echo.received);

    return echo;
}