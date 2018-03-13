var minecraftServiceProxy = function (lineRepository, hostInfoService, factorioService) {
    let self = this;
    let settings = require("../settings.json");
    let mineflayer = require("mineflayer");
    let rs = require("readline-sync");
    let echo = require("../behaviors/echo.js");
    let feeding = require("../behaviors/feeding.js");

    // Minecraft Account
    self.user = settings.minecraft.user ? settings.minecraft.user : rs.question("Minecraft Account: ");
    let password = settings.minecraft.password ? settings.minecraft.password : rs.question("Password: ", { hideEchoBack: true });

    let server = rs.question("Host: ").split(":");
    self.host = server[0];
    self.port = server.length >= 2 ? server[1] : "25565";
    self.hostName = self.host + ":" + self.port;
    self.isConnected = false;
    self.isRetringConnection = false;

    // 接続失敗回数
    self.connectionFailCount = 0;

    // 接続
    self.connect = function () {
        // Bot を初期化
        self.bot = mineflayer.createBot({
            host: self.host,
            port: self.port,
            username: self.user,
            password: password,
            verbose: true
        });

        // 正常に接続しました
        self.bot.on("login", self.onLogined);

        // 接続が終了しました
        self.bot.on("end", self.onEnded);
    };

    // ログアウト
    self.disconnect = function () {
        minecraft.isRetringConnection = false;
        minecraft.bot.quit();
    }

    self.onLogined = function()
    {
        lineRepository.save({
            hostName: self.hostName,
            createdAt: new Date(),
            type: "notice",
            text: self.hostName + " に正常に接続しました。"
        });

        /*
        if (self.hostName in settings.chatFormat) {
            for (key in settings.chatFormat[self.hostName]) {
                self.bot.chatAddPattern(new RegExp(settings.chatFormat[self.hostName][key]["regex"], "i"), key, settings.chatFormat[self.hostName][key]["description"]);
            }
        }
        */

        // lineRepository
        lineRepository.onSent = (msg) => self.bot.chat(msg);
        lineRepository.canSend = () => self.isConnected;
        self.bot.on("message", (msg) => lineRepository.receive(self.hostName, msg));

        // Behaviors
        self.bot.echo = echo(lineRepository, hostInfoService, factorioService);

        self.isConnected = true;
        self.isRetringConnection = true;
        self.connectionFailCount = 0;
    }

    self.onEnded = function()
    {
        // ログアウトしたら自動的に再接続する
        if (self.isRetringConnection) {
            lineRepository.save({
                hostName: self.hostName,
                createdAt: new Date(),
                type: "error",
                text: self.hostName + " との接続が終了しました。10 秒後に再接続します。"
            });

            setTimeout(() => self.connect(), 10000);
        }
        else {
            lineRepository.save({
                hostName: self.hostName,
                createdAt: new Date(),
                type: "notice",
                text: self.hostName + " との接続が終了しました。"
            });
        }

        self.bot = null;
        self.isConnected = false;
    }
    
    if (settings.connectOnStartup) minecraftServiceProxy.connect();

    return this;
}

module.exports = minecraftServiceProxy;