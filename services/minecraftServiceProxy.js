var minecraftServiceProxy = function (lineRepository) {
    var self = this;
    var settings = require('../settings.json');
    var mineflayer = require('mineflayer');
    var rs = require('readline-sync');

    // Minecraft Account
    if(settings.minecraft.user) console.log('Minecraft Account: ' + settings.minecraft.user);
    var account = settings.minecraft.user ? settings.minecraft.user : rs.question('Minecraft Account: ');
    var password = settings.minecraft.password ? settings.minecraft.password : rs.question('Password: ', { hideEchoBack: true });

    var server = rs.question('Host: ').split(':');

    self.lineRepository = lineRepository;
    self.line = null;
    self.entity = null;
    self.motion = null;

    self.host = server[0];
    self.port = server.length >= 2 ? server[1] : '25565';
    self.hostName = self.host + ':' + self.port;
    self.isConnected = false;
    self.isRetryingConnection = false;
    self.userName = '';

    // 接続失敗回数
    self.connectionFailCount = 0;

    // 接続
    self.connect = function () {
        try {
            // Bot を初期化
            self.bot = mineflayer.createBot({
                host: self.host,
                port: self.port,
                username: account,
                // password: password,
                verbose: true
            });

            // 機能をロード
            // self.line = require('./lineService')(lineRepository);
            self.player = require('./playerService.js')();
            self.entity = require('./entityService.js')();
            self.motion = require('./motionService.js')(self.bot, self.lineRepository, self.entity);

            // 正常に接続した
            self.bot.on('login', self.onLogined);

            // 正常異常を問わず接続が終了した
            self.bot.on('end', self.onEnded);

            if (self.lineRepository != null) {
                // チャットを受信
                self.bot.on('message', (msg) => self.lineRepository.receive(self.hostName, msg));
            }

            if (self.player != null) {
                // プレイヤーが参加
                self.bot.on('playerJoined', self.player.playersChanged);

                // プレイヤーが退出
                self.bot.on('playerLeft', self.player.playersChanged);
            }

            if (self.entity != null) {
                // エンティティが移動
                self.bot.on('entityMoved', self.entity.onMoved);

                // エンティティが発生
                self.bot.on('entitySpawn', self.entity.onSpawn);

                // エンティティが消滅
                self.bot.on('entityGone', self.entity.onGone);
            }

            if (self.motion != null) {
                // エンティティが移動
                self.bot.on('entityMoved', self.motion.onMoved);
            }
        }
        catch (error) {
            console.log(error);
        }
    };

    // ログアウト
    self.disconnect = function () {
        self.isRetryingConnection = false;
        self.bot.quit();
        self.line = null;
        self.player = null;
        self.entity = null;
        self.motion = null;
    };

    self.onLogined = async function () {
        await self.lineRepository.saveAsync({
            hostName: self.hostName,
            createdAt: new Date(),
            type: 'notice',
            text: self.hostName + ' に正常に接続しました。'
        });

        self.userName = bot.username;
        self.isConnected = true;
        self.isRetryingConnection = true;
        self.connectionFailCount = 0;

        // lineRepository
        if (self.lineRepository != null) {
            self.lineRepository.onSent = (msg) => self.bot.chat(msg);
            self.lineRepository.canSend = () => self.isConnected;
            self.player.playersChanged(self.bot.players);
        }
    };

    self.onSpawn = function()
    {
        console.log(JSON.stringify(self.bot));
    }

    self.onEnded = async function () {
        // ログアウトしたら自動的に再接続する
        if (self.isRetryingConnection) {
            await self.lineRepository.saveAsync({
                hostName: self.hostName,
                createdAt: new Date(),
                type: 'error',
                text: self.hostName + ' との接続が終了しました。10 秒後に再接続します。'
            });

            setTimeout(() => self.connect(), 10000);
        }
        else {
            await self.lineRepository.saveAsync({
                hostName: self.hostName,
                createdAt: new Date(),
                type: 'notice',
                text: self.hostName + ' との接続が終了しました。'
            });
        }

        self.bot = null;
        self.isConnected = false;
    };

    if (settings.connectOnStartup) minecraftServiceProxy.connect();

    return self;
}

module.exports = minecraftServiceProxy;