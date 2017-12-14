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
    if (line.body.match(/ほのほの/)) {
        feeding.invoke();
    }
    else if (line.body.match(/えさ/) && isInvoked) {
        feeding.await();
    }
}

// パンを渡される
feeding.onPlayerCollect = (collector, collectedItem) => {
    console.log(JSON.stringify(collectedItem));
    
    var now = (new Date()).getTime();

    if (!isInvoked && !isAwaited) return;
    if (collector.type != "player") return;
    if (collector.username != bot.username) return;
    if (collectedItem.type != 297) return;
    if (now <= feeding.lastCalledTime + feeding.cooldownTime) return;

    feeding.answer();
}

feeding.invoke = () => {
    line.send("ほの");
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
    lines.onReceived((line) => feeding.onCalled(line));
    bot.on("playerCollect", (collector, collected) => feeding.onPlayerCollect(collector, collected));
    return feeding;
}