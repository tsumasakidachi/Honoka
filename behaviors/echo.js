var echo = function (lineRepository, hostInfoService, factorioService) {
    var self = this;

    self.factorio = function(line) {
        if (!line.body || !line.body.match(/(factorio|ファクトリオ)/i)) return;

        self.asnwerFactorio();
    };

    self.asnwerFactorio = async function (hostInfo) {
        var hostInfo = await hostInfoService.getAsync(self.asnwerFactorio);
        var isOnline = await factorioService.isOnlineAsync();

        var status = isOnline ? 'オンライン' : 'オフライン';

        lineRepository.send('Factorio マルチ鯖: ' + hostInfo.address + ' ' + status);
    };

    lineRepository.onReceived(self.factorio);

    return this;
}

module.exports = echo;