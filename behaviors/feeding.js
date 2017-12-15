// 給餌プロトコル
// ほのほの
// ↓
// ほの
// ↓
// えさ
// ↓
// パンをもらう
// ↓
// 今日もパンがうまい

var lines = require("../repositories/linesRepository.js");
var feeding = {};

// ほのほのされたかどうか
var isInvoked = false;

// えさと言われたかどうか
var isAwaited = false;

feeding.cooldownTime = 30 * 1000;
feeding.lastCalledTime = 0;

// 呼び出される
feeding.onCalled = (line) => {
    if (line.body.match(/^ほのほの$/)) {
        feeding.invoke();
    }
    else if (line.body.match(/^えさ$/) && isInvoked) {
        feeding.await();
    }
}

// パンを渡される
feeding.onPlayerCollect = (collector, collected) => {
    var hasBread = false;
    
    var now = (new Date()).getTime();

    if (!isInvoked && !isAwaited) return;
    if (collector.type != "player") return;
    if (collector.username != bot.username) return;
    if (collected.type != "object") return;

    for(key in collected.metadata)
    {
        if("blockId " in collected.metadata[key] && collected.metadata[key].blockId == 297) hasBread = true;
    }

    if (!hasBread) return;
    if (now <= feeding.lastCalledTime + feeding.cooldownTime) return;

    feeding.answer();
}

feeding.invoke = () => {
    lines.send("ほの");
    isInvoked = true;
}

feeding.await = () => {
    isAwaited = true;
}

// 今日もパンがうまい！
feeding.answer = () => {
    lines.send("今日もパンがうまい！");
    feeding.lastCalledTime = (new Date()).getTime();
    feeding.clear();
}

// リセット
feeding.clear = () => {
    isInvoked = false;
    isAwaited = false;
}

module.exports = function (bot) {
    lines.onReceived((lines) => feeding.onCalled(lines));
    bot.on("playerCollect", (collector, collected) => feeding.onPlayerCollect(collector, collected));
    return feeding;
}