// パンをもらったら今日もパンがうまいと叫ぶ

var lines = require("../repositories/linesRepository.js");

module.require = function (bot) {
    var pangaumai = {};
    pangaumai.cooldownTime = 30 * 1000;
    pangaumai.lastCalledTime = 0;

    bot.on("playerCollect", (collector, collected) => {
        var now = (new Date()).getTime();
        if (collector.username != bot.username) return;
        if (collected.type != 297) return;
        if (now <= pangaumai.lastCalledTime + pangaumai.cooldownTime) return;

        lines.send("今日もパンがうまい");
        pangaumai.lastCalledTime = (new Date()).getTime();
    });


    return pangaumai;
}