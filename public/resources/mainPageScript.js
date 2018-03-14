$(function () {
    function TimelinePageViewModel() {
        var self = this;

        self.result = ko.observable('');
        self.lines = ko.observableArray([]);
        self.upper = ko.observable(-1);
        self.lower = ko.observable(-1);
        self.text = ko.observable('');
        self.unreadsCount = ko.observable(0);
        self.unreadsCountVisibility = ko.computed(() => self.unreadsCount > 0);

        self.isLogined = ko.observable(false);
        self.connectButtonVisibility = ko.computed(function () { return !self.isLogined(); });
        self.disconnectButtonVisibility = ko.computed(function () { return self.isLogined(); });

        self.post = function (sender, e) {
            let uri = $(sender).attr('action');
            let data = {
                'text': self.text()
            };

            $.post(uri, data, self.onPost, 'json');
        };

        self.onPost = function (response, status) {
            if (status != 'success') return;

            // self.refresh();
            self.text('');
        };

        self.refresh = function () {
            let uri = $('#messages').attr('data-uri-selection');
            let params = {
                lower: self.upper() + 1
            };

            $.getJSON(uri, params, self.refreshTimeline);
        };

        self.refreshTimeline = function (responce, status) {
            if (status != 'success' || responce.lines.length == 0) return;

            // ViewModel にあるまじき View の操作
            // というかこのオブジェクトそもそも ViewModel じゃない
            var windowHeight = $(window).height();
            var contentHeight = $('#framework').height();
            var scrollOffset = $(window).scrollTop();

            for (var i = 0; i < responce.lines.length; i++) {
                responce.lines[i].createdAt = ko.observable(new Date(responce.lines[i].createdAt));
                responce.lines[i].createdAtText = ko.observable(responce.lines[i].createdAt().toLocaleString());
                self.lines.push(responce.lines[i]);
            };

            self.upper(responce.upper);
            self.lower(responce.lower);

            if (contentHeight - windowHeight == scrollOffset) {
                $(window).scrollTop($('.messagesViewItem').last().offset().top);
            }
            else {
                self.unreadsCount(self.unreadsCount() + responce.lines.length);
            }
        };

        self.connect = function (sender, e) {
            let uri = $('#connectButton').attr('href');

            console.log(uri);

            $.post(uri, {}, (function (response, status) {
                if (status != "success") return;

                self.isConnected(response.isConnected);
            }));
        };

        self.disconnect = function (sender, e) {
            let uri = $('#disconnectButton').attr('href');

            $.post(uri, {}, (function (response, status) {
                if (status != "success") return;

                self.isConnected(response.isConnected);
            }));
        };

        setInterval(self.refresh, 1000);

        return this;
    }

    ko.applyBindings(TimelinePageViewModel());
});