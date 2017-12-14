var express = require("express");
var router = express.Router();

router.get("/players", (req, res, next) => {
    var players = req.minecraft.isConnected ? req.minecraft.bot.players : {};
    res.json(players);
});

router.get("/", async (req, res, next) => {
    var properties = {
        "host": req.minecraft.host + ":" + req.minecraft.port,
        "isConnected": req.minecraft.isConnected,
        "user": req.minecraft.isConnected ? req.minecraft.bot.username : null
    };

    res.json(properties);
});

module.exports = router;