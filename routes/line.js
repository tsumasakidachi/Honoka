var express = require("express");
var qs = require("querystring");
var router = express.Router();

/* GET home page. */
router.get("/latest", async (req, res, next) => {
    var since = "since" in req.query ? req.query.since : 0;
    var option = {
        host: req.minecraft.host + ":" + req.minecraft.port,
        since: since
    };
    req.line.getLatest(option, (error, rows, fields) => {
        var latest = rows.length - 1;
        res.json({
            latestLineId: rows.length > 0 ? rows[latest]["id"] : since,
            lines: rows
        });
    });
});
router.post("/create", async (req, res, next) => {
    if (!("message" in req.body)) throw new Error("message が空です。");
    var message = req.body.message;
    req.line.send(message);
    res.json({});
});

module.exports = router;