// 視線が合ってパンチされたら穂乃果だよと叫ぶ

var honokadayo = {};
honokadayo.nearest = null;
honokadayo.onEntityMoved = (e) => {

};

module.exports = (bot) => {
    bot.on("entityMoved", (e) => honokadayo.onEntityMoved(e));
    return honokadayo;
}