var minecraft = {};
var settings = require("../settings.json");
var mineflayer = require("mineflayer");
var rs = require("readline-sync");
var lines = require("../repositories/linesRepository.js");
var echo = require("../behaviors/echo.js");
var pangaumai = require("../behaviors/pangaumai.js");

// Minecraft Bot
minecraft.user = settings.minecraft.user ? settings.minecraft.user : rs.question("Minecraft Account: ");

minecraft.password = settings.minecraft.password ? settings.minecraft.password : rs.question("Password: ", { hideEchoBack: true });

var server = rs.question("Host: ").split(":");
minecraft.host = server[0];
minecraft.port = server.length >= 2 ? server[1] : "25565";
minecraft.hostName = minecraft.host + ":" + minecraft.port;
console.log("");

minecraft.isConnected = false;
minecraft.isRetringConnection = false;

// 接続失敗回数
minecraft.connectionFailCount = 0;

// 接続
minecraft.connectAsync = async function (onLogin) {
    try {
        // Bot を初期化
        minecraft.bot = mineflayer.createBot({
            host: minecraft.host,
            port: minecraft.port,
            username: minecraft.user,
            password: minecraft.password,
            verbose: true
        });

        // 正常に接続しました
        minecraft.bot.on("login", () => {
            lines.save({
                host: minecraft.hostName,
                createdAt: new Date(),
                type: "notice",
                body: minecraft.hostName + " に正常に接続しました。"
            });

            /*
            if(minecraft.hostName in settings.chatFormat)
            {
                for(key in settings.chatFormat[minecraft.hostName])
                {
                    minecraft.bot.chatAddPattern(settings.chatFormat[minecraft.hostName][key]["regex"], key, settings.chatFormat[minecraft.hostName][key]["description"]);
                }
            }
            */

            // lines
            lines.onSent = (msg) => { minecraft.bot.chat(msg); };
            lines.canSend = () => minecraft.isConnected;
            minecraft.bot.on("message", async (msg) => await lines.receiveAsync(minecraft.hostName, msg));

            // Behaviors
            minecraft.bot.echo = echo();
            minecraft.bot.pangaumai = pangaumai(minecraft.bot);

            minecraft.isConnected = true;
            minecraft.isRetringConnection = true;
            minecraft.connectionFailCount = 0;

            // コールバックを実行
            onLogin();
        });

        // 接続が終了しました
        minecraft.bot.on("end", async () => {
            // ログアウトしたら自動的に再接続する
            if (minecraft.isRetringConnection) {
                await lines.save({
                    host: minecraft.hostName,
                    createdAt: new Date(),
                    type: "error",
                    body: minecraft.hostName + " との接続が終了しました。10 秒後に再接続します。"
                });
                setTimeout(async () => await minecraft.connectAsync(onLogin), 10000);
            }
            else {
                await lines.save({
                    host: minecraft.hostName,
                    createdAt: new Date(),
                    type: "notice",
                    body: minecraft.hostName + " との接続が終了しました。"
                });
            }

            minecraft.bot = null;
            minecraft.isConnected = false;

        });
    }
    catch (error) {
        lines.save({
            host: minecraft.hostName,
            createdAt: new Date(),
            type: "error",
            body: minecraft.hostName + " へ接続しようとしましたが次のエラーによってに失敗しました:\n" + error
        });

        minecraft.connectionFailCount++;

        // 10 分間接続を再試行し続ける
        // 0.5 分間 (10 秒 * 3 回)
        if (minecraft.connectionFailCount <= 3 && minecraft.isRetringConnection) {
            setTimeout(async () => await minecraft.connectAsync(onLogin), 10000);
        }
        // 4.5 分間 (30 秒 * 9 回)
        else if (minecraft.connectionFailCount <= 11 && minecraft.isRetringConnection) {
            setTimeout(async () => await minecraft.connectAsync(onLogin), 30000);
        }
        // 5 分間 (60 秒 * 5 回)
        else if (minecraft.connectionFailCount <= 16 && minecraft.isRetringConnection) {
            setTimeout(async () => await minecraft.connectAsync(onLogin), 60000);
        }
    }
};

// ログアウト
minecraft.disconnectAsync = function (onLogout) {
    minecraft.isRetringConnection = false;
    minecraft.bot.quit();
    onLogout();
}

if (settings.connectOnStartup) minecraft.connectAsync();

module.exports = minecraft;