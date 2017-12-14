// パンをもらったら今日もパンがうまいと叫ぶ

var lines = require("../repositories/linesRepository.js");

var pangaumai = {};
pangaumai.cooldownTime = 30 * 1000;
pangaumai.lastCalledTime = 0;

pangaumai.onPlayerCollect = (collector, collectedItem) => {
    console.log(JSON.stringify(collectedItem));
    var now = (new Date()).getTime();
    if (collector.type != "player") return;
    if (collector.username != bot.username) return;
    if (collectedItem.type != 297) return;
    if (now <= pangaumai.lastCalledTime + pangaumai.cooldownTime) return;

    pangaumai.call();
}

pangaumai.call = () => {
    lines.send("今日もパンがうまい");
    pangaumai.lastCalledTime = (new Date()).getTime();
}

module.exports = function (bot) {
    bot.on("playerCollect", (collector, collected) => pangaumai.onPlayerCollect(collector, collected));
    return pangaumai;
}