var echo = function (lineRepository, hostInfoService, factorioService) {
    var self = this;

    self.lineRepository = lineRepository;
    self.hostInfoService = hostInfoService;
    self.factorioService = factorioService;

    self.asnwerFactorio = async (line) => {
        if (!line.body || !line.body.match(/(factorio|ファクトリオ|ふぁくとりお)/i)) return;

        var hostInfo = await self.hostInfoService.getHostInfoAsync();
        var isOnline = await self.factorioService.isOnlineAsync();

        var status = isOnline ? 'オンライン' : 'オフライン';

        self.lineRepository.send('Factorio マルチ鯖: ' + hostInfo.address + ' ' + status);
    };

    self.lineRepository.onReceived(((line) => self.asnwerFactorio(line)).bind(self));

    return this;
}

module.exports = echo;