var minecraftServiceProxy = function (lineRepository, playersRepository, echoServiceService) {
    var self = this;
    var settings = require('../settings.json');
    var mineflayer = require('mineflayer');
    var rs = require('readline-sync');

    // Minecraft Account
    var account = settings.minecraft.user ? settings.minecraft.user : rs.question('Minecraft Account: ');
    var password = settings.minecraft.password ? settings.minecraft.password : rs.question('Password: ', { hideEchoBack: true });

    var server = rs.question('Host: ').split(':');

    self.echoService = echoServiceService;
    self.playersRepository = playersRepository;
    self.linesRepository = lineRepository;

    self.host = server[0];
    self.port = server.length >= 2 ? server[1] : '25565';
    self.hostName = self.host + ':' + self.port;
    self.isConnected = false;
    self.isRetringConnection = false;
    self.userName = '';

    // 接続失敗回数
    self.connectionFailCount = 0;

    // 接続
    self.connect = function () {
        // Bot を初期化
        self.bot = mineflayer.createBot({
            host: self.host,
            port: self.port,
            username: account,
            password: password,
            verbose: true
        });

        // 正常に接続しました
        self.bot.on('login', self.onLogined);

        // 接続が終了しました
        self.bot.on('end', self.onEnded);

        // チャットを受信
        self.bot.on('message', (msg) => self.linesRepository.receive(self.hostName, msg));

        // プレイヤーが参加
        self.bot.on('playerJoined'), (player) => self.playersRepository.playersChanged(self.bot.players);

        // プレイヤーが退出
        self.bot.on('playerLeft'), (player) => self.playersRepository.playersChanged(self.bot.players);
    };

    // ログアウト
    self.disconnect = function () {
        self.isRetringConnection = false;
        self.bot.quit();
    }

    self.onLogined = async function()
    {
        await self.linesRepository.saveAsync({
            hostName: self.hostName,
            createdAt: new Date(),
            type: 'notice',
            text: self.hostName + ' に正常に接続しました。'
        });

        // lineRepository
        self.linesRepository.onSent = (msg) => self.bot.chat(msg);
        self.linesRepository.canSend = () => self.isConnected;
        self.playersRepository.playersChanged(self.bot.players);

        self.userName = bot.username;
        self.isConnected = true;
        self.isRetringConnection = true;
        self.connectionFailCount = 0;
    }

    self.onEnded = async function()
    {
        // ログアウトしたら自動的に再接続する
        if (self.isRetringConnection) {
            await self.linesRepository.saveAsync({
                hostName: self.hostName,
                createdAt: new Date(),
                type: 'error',
                text: self.hostName + ' との接続が終了しました。10 秒後に再接続します。'
            });

            setTimeout(() => self.connect(), 10000);
        }
        else {
            await self.linesRepository.saveAsync({
                hostName: self.hostName,
                createdAt: new Date(),
                type: 'notice',
                text: self.hostName + ' との接続が終了しました。'
            });
        }

        self.bot = null;
        self.isConnected = false;
    }
    
    if (settings.connectOnStartup) minecraftServiceProxy.connect();

    return this;
}

module.exports = minecraftServiceProxy;