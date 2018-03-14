$(function () {
    function mainPageScript() {
        this.isConnected = ko.observable(false);
        this.userName = ko.observable('');
        this.hostName = ko.observable('');
        this.text = ko.observable('');

        this.lines = ko.observableArray([]);
        this.upper = ko.observable(-1);
        this.lower = ko.observable(-1);
        this.unreadsCount = ko.observable(0);
        this.unreadsCountVisibility = ko.computed((function () { return this.unreadsCount() > 0 }).bind(this));

        this.connectButtonVisibility = ko.computed((function () { return !this.isConnected(); }).bind(this));
        this.disconnectButtonVisibility = ko.computed((function () { return this.isConnected(); }).bind(this));

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
            let linesUri = $('#messages').attr('data-uri-selection');
            let linesParams = {
                lower: this.upper() + 1
            };

            let propsUri = '/.repos/properties/';
            let propsParams = {};

            $.getJSON(linesUri, linesParams, (function (response, status) { this.refreshTimeline(response, status) }).bind(this));
            $.getJSON(propsUri, propsParams, (function (response, status) { this.refreshProperties(response, status) }).bind(this));
        };

        this.refreshTimeline = function (response, status) {
            if (status != 'success' || response.lines.length == 0) return;

            var windowHeight = $(window).height();
            var contentHeight = $('#framework').height();
            var scrollOffset = $(window).scrollTop();

            for (var i = 0; i < response.lines.length; i++) {
                response.lines[i].createdAt = ko.observable(new Date(response.lines[i].createdAt));
                response.lines[i].createdAtText = ko.observable(response.lines[i].createdAt().toLocaleString());
                this.lines.push(response.lines[i]);
            };

            this.upper(response.upper);
            this.lower(response.lower);

            if (contentHeight - windowHeight == scrollOffset) {
                $(window).scrollTop($('.messagesViewItem').last().offset().top);
            }
            else {
                this.unreadsCount(this.unreadsCount() + response.lines.length);
            }
        };

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
            var windowHeight = $(window).height();
            var contentHeight = $('#framework').height();
            var scrollOffset = $(window).scrollTop();
            
            if (contentHeight - windowHeight == scrollOffset) {
                this.unreadsCount(0);
            }
        }).bind(this));

        setInterval((() => this.refresh()).bind(this), 1000);

        return this;
    }

    ko.applyBindings(mainPageScript());
});