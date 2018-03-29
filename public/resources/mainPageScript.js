$(function () {
    function mainPageScript() {
        var self = this;

        self.isConnected = ko.observable(false);
        self.userName = ko.observable('');
        self.hostName = ko.observable('');
        self.text = ko.observable('');
        self.searchKeyword = ko.observable('');

        self.isRefreshWorking = ko.observable(false);

        self.lines = ko.observableArray([]);

        self.upper = ko.computed((function () {
            let ids = self.lines().map((function (l) { return l.id; }).bind(self));
            return ids.length > 0 ? Math.max(...ids) : 0;
        }).bind(self));

        self.lower = ko.computed((function () {
            let ids = self.lines().map((function (l) { return l.id; }).bind(self));
            return ids.length > 0 ? Math.min(...ids) : 0;
        }).bind(self));

        self.unreadsCount = ko.observable(0);
        self.unreadsCountVisibility = ko.pureComputed((function () { return self.isConnected() && self.unreadsCount() > 0 }).bind(self));

        self.isConnectionFlyoutOpen = ko.observable(false);

        self.post = function (sender, e) {
            let uri = '/.repos/lines/create/';
            let data = {
                'text': self.text()
            };

            $.post(uri, data, (function (response, status) { self.onPost(response, status) }).bind(self), 'json');
        };

        self.onPost = function (response, status) {
            if (status != 'success') return;

            // self.refresh();
            self.text('');
        };

        self.refresh = function () {
            if (!self.isRefreshWorking()) self.refreshLines('newer');

            let uri = '/.repos/properties/';
            let propsParams = {};

            $.getJSON(uri, propsParams, (function (response, status) { self.refreshProperties(response, status) }).bind(self));
        };

        self.refreshLines = function (mode) {
            if (!mode || (mode != 'newer' && mode != 'older') || self.isRefreshWorking()) throw new Error();

            let uri = '/.repos/lines/';
            let params = {
                count: 200
            };

            if (mode == 'newer') {
                params.lower = self.upper() + 1;
                $.getJSON(uri, params, (function (response, status) { self.onGotNewerLines(response, status) }).bind(self));
            }

            if (mode == 'older' && self.lower() >= 0) {
                params.upper = self.lower() - 1;
                $.getJSON(uri, params, (function (response, status) { self.onGotOlderLines(response, status) }).bind(self));
            }
        }

        self.onGotNewerLines = function (response, status) {
            if (status != 'success' || response.lines.length == 0) return;

            self.isRefreshWorking(true);

            let windowHeight = $(window).height();
            let contentHeight = $('#framework').height();
            let scrollOffset = $(window).scrollTop();

            response.lines = self.parseLines(response.lines);
            response.lines.forEach((function (l) { self.lines.push(l); }).bind(self));

            if (contentHeight - windowHeight == scrollOffset) {
                $(window).scrollTop($('#linesView.listView .listViewItem').last().offset().top);
            }
            else {
                self.unreadsCount(self.unreadsCount() + response.lines.length);
            }

            self.isRefreshWorking(false);
        };

        self.onGotOlderLines = function (response, status) {
            if (status != 'success' || response.lines.length == 0) return;

            self.isRefreshWorking(true);

            response.lines = self.parseLines(response.lines);
            response.lines.reverse().forEach((function (l) { self.lines.unshift(l); }).bind(self));

            let addedItemsHeight = $('#linesView.listView .listViewItem')
                .filter(function (index) { return index >= 0 && index < response.lines.length; })
                .map(function (index, element) { return $(element).height(); })
                .toArray()
                .reduce(function (prev, current) { return prev += current; });

            let scrollOffset = $(window).scrollTop();
            $(window).scrollTop(scrollOffset + addedItemsHeight);

            self.isRefreshWorking(false);
        }

        self.parseLines = function (lines) {
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

        self.refreshProperties = function (response, status) {
            if (status != 'success') return;

            self.isConnected(response.isConnected);
            self.userName(response.userName);
            self.hostName(response.hostName);
        }

        self.connect = function (sender, e) {
            let uri = '/.repos/connection/connect/';

            $.post(uri, {}, (function (response, status) {
                if (status != "success") return;

                self.isConnected(response.isConnected);
            }).bind(self));

            self.isConnectionFlyoutOpen(false);
        };

        self.disconnect = function (sender, e) {
            let uri = '/.repos/connection/disconnect/';

            $.post(uri, {}, (function (response, status) {
                if (status != "success") return;

                self.isConnected(response.isConnected);
            }).bind(self));

            self.isConnectionFlyoutOpen(false);
        };

        self.openToggleConnectionFlyout = function () {
            self.isConnectionFlyoutOpen(!self.isConnectionFlyoutOpen());
        }

        $(window).scroll((function () {
            let windowHeight = $(window).height();
            let contentHeight = $('#framework').height();
            let scrollOffset = $(window).scrollTop();

            // ページの一番下に来たら新しいラインをリセットする
            if (contentHeight - windowHeight == scrollOffset) {
                self.unreadsCount(0);
            }

            // ページの一番上に来たら古いラインを取得する
            if (scrollOffset <= 0 && !self.isRefreshWorking()) {
                self.refreshLines('older');
            }
        }).bind(self));

        /*
        $(window).click(function () {
            self.isConnectionFlyoutOpen(false);
        });

        $(".flyout").click(function (event) {
            event.stopPropagation();
        });
        */

        setInterval((function () { self.refresh(); }).bind(self), 1000);

        return self;
    }

    ko.applyBindings(mainPageScript());
});