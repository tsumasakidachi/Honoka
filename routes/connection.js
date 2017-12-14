var express = require('express');
var router = express.Router();

/* GET home page. */
router.post('/connect', async (req, res, next) => {
    await req.minecraft.connectAsync((error) => {
        if (error) throw error;

        res.json({
            "user": req.minecraft.username,
            "isConnected": true
        });
    });
});

/* GET home page. */
router.post('/disconnect', async (req, res, next) => {
    await req.minecraft.disconnectAsync((error) => {
        if (error) throw error;

        res.json({
            "isConnected": false
        });
    });
});

module.exports = router;