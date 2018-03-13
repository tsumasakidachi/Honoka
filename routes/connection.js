var express = require('express');
var router = express.Router();

/* GET home page. */
router.post('/connect', (req, res, next) => {
    req.minecraft.connectc((error) => {
        if (error) throw error;

        res.json({
            "user": req.minecraft.username,
            "isConnected": true
        });
    });
});

/* GET home page. */
router.post('/disconnect', (req, res, next) => {
    req.minecraft.disconnect((error) => {
        if (error) throw error;

        res.json({
            "isConnected": false
        });
    });
});

module.exports = router;