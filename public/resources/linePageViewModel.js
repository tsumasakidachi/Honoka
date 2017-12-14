$(function () {
    var indexViewModel = new Vue(
        {
            el: "#framework",

            data:
                {
                    worker: null,
                    me: null,
                    isConnected: false,
                    host: "",
                    user: "",
                    email: null,
                    password: null,
                    server: null,
                    lines: [],
                    entities: {},
                    blocks: {},
                    latestLineId: 0,
                    body: ""
                },

            computed:
                {
                    connectivity: function () {
                        return this.isConnected ? "&#xE870;" : "&#xE871;";
                    }
                },

            methods:
                {
                    onNavigatedTo: function () {
                        this.worker = new Worker("/resources/worker.js");
                        this.refreshProperties();
                        this.worker.postMessage({
                            command: "refreshLines"
                        });

                        $("#sendingMessage").submit((function (e) {
                            e.preventDefault();
                            this.sendMessage();
                        }).bind(this));

                        $("#logo a").click((function (e) {
                            e.preventDefault();

                            if (this.isConnected)
                                this.disconnect();
                            else
                                this.connect();
                        }).bind(this));

                        this.worker.addEventListener("message", (function (e) {
                            switch (e.data.command) {
                                case "refreshLines":
                                    this.refreshLines();
                                    break;
                            }
                        }).bind(this));

                        setInterval((function () {
                            this.worker.postMessage({
                                command: "refreshLines"
                            });
                        }).bind(this), 1000);
                    },

                    connect: function () {
                        var uri = "/repositories/connection/connect/";
                        $.post(uri, {}, (function (response, status) {
                            if (status != "success") return;

                            this.user = response.user;
                            this.isConnected = response.isConnected;
                        }).bind(this));
                    },

                    disconnect: function (e) {
                        var uri = "/repositories/connection/disconnect/";
                        $.post(uri, {}, (function (response, status) {
                            if (status != "success") return;

                            this.isConnected = response.isConnected;
                        }).bind(this));
                    },

                    refreshLines: function () {
                        var url = "/repositories/lines/latest/";
                        url += "?since=" + this.latestLineId;

                        $.getJSON(url, (function (response, status) {
                            response.lines.forEach((function (l) {
                                if (status != "success") return;

                                l.createdAt = new Date(l.createdAt).toLocaleString();
                                this.lines.unshift(l);
                            }).bind(this));

                            this.latestLineId = response.latestLineId;
                        }).bind(this));
                    },

                    sendMessage: function () {
                        if (!this.body) return;

                        $.post("/repositories/lines/create/",
                            {
                                body: this.body
                            },
                            (function (response, status) {
                                if (status != "success") return;

                                this.body = "";
                            }).bind(this)
                        );
                    },

                    refreshProperties: function (callback) {
                        var url = "/repositories/properties/";

                        $.getJSON(url, (function (properties, status) {
                            this.isConnected = properties.isConnected;
                            this.host = properties.host;
                            this.user = properties.user;
                        }).bind(this));
                    }
                }
        });

    indexViewModel.onNavigatedTo();
});