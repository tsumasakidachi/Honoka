$(function () {
    function mainPageScript() {
        this.isConnected = ko.observable(false);
        this.userName = ko.observable('');
        this.hostName = ko.observable('');
        this.text = ko.observable('');

        this.isRefreshWorking = ko.observable(false);

        this.lines = ko.observableArray([]);

        this.upper = ko.computed((function () {
            let ids = this.lines().map((function (l) { return l.id; }).bind(this));
            return ids.length > 0 ? Math.max(...ids) : 0;
        }).bind(this));

        this.lower = ko.computed((function () {
            let ids = this.lines().map((function (l) { return l.id; }).bind(this));
            return ids.length > 0 ? Math.min(...ids) : 0;
        }).bind(this));

        this.unreadsCount = ko.observable(0);
        this.unreadsCountVisibility = ko.pureComputed((function () { return this.isConnected() && this.unreadsCount() > 0 }).bind(this));

        this.connectButtonVisibility = ko.pureComputed((function () { return !this.isConnected(); }).bind(this));
        this.disconnectButtonVisibility = ko.pureComputed((function () { return this.isConnected(); }).bind(this));

        this.post = function (sender, e) {
            let uri = $(sender).attr('action');
            let data = {
                'text': this.text()
            };

            $.post(uri, data, (function (response, status) { this.onPost(response, status) }).bind(this), 'json');
        };

        this.onPost = function (response, status) {
            if (status != 'success') return;

            // this.refresh();
            this.text('');
        };

        this.refresh = function () {
            if(!this.isRefreshWorking()) this.refreshLines('newer');

            let propsUri = '/.repos/properties/';
            let propsParams = {};

            $.getJSON(propsUri, propsParams, (function (response, status) { this.refreshProperties(response, status) }).bind(this));
        };

        this.refreshLines = function (mode) {
            if (!mode || (mode != 'newer' && mode != 'older') || this.isRefreshWorking()) throw new Error();

            let uri = $('#linesView.listView').attr('data-uri-selection');
            let params = {
                count: 200
            };

            if (mode == 'newer') {
                params.lower = this.upper() + 1;
                $.getJSON(uri, params, (function (response, status) { this.onGotNewerLines(response, status) }).bind(this));
            }

            if (mode == 'older' && this.lower() >= 0) {
                params.upper = this.lower() - 1;
                $.getJSON(uri, params, (function (response, status) { this.onGotOlderLines(response, status) }).bind(this));
            }
        }

        this.onGotNewerLines = function (response, status) {
            if (status != 'success' || response.lines.length == 0) return;

            this.isRefreshWorking(true);

            let windowHeight = $(window).height();
            let contentHeight = $('#framework').height();
            let scrollOffset = $(window).scrollTop();

            response.lines = this.parseLines(response.lines);
            response.lines.forEach((function (l) { this.lines.push(l); }).bind(this));

            if (contentHeight - windowHeight == scrollOffset) {
                $(window).scrollTop($('#linesView.listView .listViewItem').last().offset().top);
            }
            else {
                this.unreadsCount(this.unreadsCount() + response.lines.length);
            }

            this.isRefreshWorking(false);
        };

        this.onGotOlderLines = function (response, status) {
            if (status != 'success' || response.lines.length == 0) return;

            this.isRefreshWorking(true);

            response.lines = this.parseLines(response.lines);
            response.lines.reverse().forEach((function (l) { this.lines.unshift(l); }).bind(this));

            let addedItemsHeight = $('#linesView.listView .listViewItem')
                .filter(function (index) { return index >= 0 && index < response.lines.length; })
                .map(function (index, element) { return $(element).height(); })
                .toArray()
                .reduce(function(prev, current) { return prev += current; });

            let scrollOffset = $(window).scrollTop();
            $(window).scrollTop(scrollOffset + addedItemsHeight);

            this.isRefreshWorking(false);
        }

        this.parseLines = function (lines) {
            for (let i = 0; i < lines.length; i++) {
                lines[i].createdAt = new Date(lines[i].createdAt);
                lines[i].createdAtText = lines[i].createdAt.toLocaleString();

                switch (lines[i].type) {
                    case 'error':
                        lines[i].typeSymbol = '&#xE814;';
                        break;
                    case 'wisper':
                        lines[i].typeSymbol = '&#xE8BD;';
                        break;
                    case 'join':
                        lines[i].typeSymbol = '&#xE72A;';
                        break;
                    case 'leave':
                        lines[i].typeSymbol = '&#xE72B;';
                        break;
                    default:
                        lines[i].typeSymbol = '';
                }
            }

            return lines;

        }

        this.refreshProperties = function (response, status) {
            if (status != 'success') return;

            this.isConnected(response.isConnected);
            this.userName(response.userName);
            this.hostName(response.hostName);
        }

        this.connect = function (sender, e) {
            let uri = $('#connectButton').attr('href');

            $.post(uri, {}, (function (response, status) {
                if (status != "success") return;

                this.isConnected(response.isConnected);
            }).bind(this));
        };

        this.disconnect = function (sender, e) {
            let uri = $('#disconnectButton').attr('href');

            $.post(uri, {}, (function (response, status) {
                if (status != "success") return;

                this.isConnected(response.isConnected);
            }).bind(this));
        };

        $(window).scroll((function () {
            let windowHeight = $(window).height();
            let contentHeight = $('#framework').height();
            let scrollOffset = $(window).scrollTop();

            // ページの一番下に来たら新しいラインをリセットする
            if (contentHeight - windowHeight == scrollOffset) {
                this.unreadsCount(0);
            }

            // ページの一番上に来たら古いラインを取得する
            if (scrollOffset <= 0 && !this.isRefreshWorking()) {
                this.refreshLines('older');
            }

        }).bind(this));

        setInterval((() => this.refresh()).bind(this), 1000);

        return this;
    }

    ko.applyBindings(mainPageScript());
});