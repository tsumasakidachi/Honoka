var express = require("express");
var qs = require("querystring");
var router = express.Router();
var bodyParser = require('body-parser');

// メッセージ
router.get('/lines', async (req, res, next) => {
    let options = {
        hostName: req.minecraft.hostName,
        upper: parseInt(req.query.upper) || null,
        lower: parseInt(req.query.lower) || null,
        count: parseInt(req.query.count) || null
    };

    let lines = await req.line.getAsync(options);
    let ids = lines.map((l) => l.id);

    res.json({
        upper: Math.max(...ids),
        lower: Math.min(...ids),
        lines: lines
    })
});

// 新しいメッセージ
router.post("/lines/create", (req, res, next) => {
    if (!req.body.text) throw new Error("text が空です。");

    req.line.send(req.body.text, 'userTypes');
    res.json(null);
});

// ログイン
router.post('/connection/connect', (req, res, next) => {
    if (req.minecraft.isConnected) {
        res.json({ "isConnected": true });
        return;
    }

    req.minecraft.connect((error) => {
        if (error) throw error;

        res.json({
            "isConnected": true
        });
    });
});

// ログアウト
router.post('/connection/disconnect', (req, res, next) => {
    if (!req.minecraft.isConnected) {
        res.json({ "isConnected": false });
        return;
    }

    req.minecraft.disconnect((error) => {
        if (error) throw error;

        res.json({
            "isConnected": false
        });
    });
});

// プロパティ
router.get('/properties/', (req, res, next) => {
    res.json({
        'isConnected': req.minecraft.isConnected,
        'userName': req.minecraft.userName,
        'hostName': req.minecraft.hostName,
        'host': req.minecraft.host,
        'port': req.minecraft.port
    })
});

module.exports = router;