module.exports = inject;

function inject(bot) {
    var entity = {
        bot: bot,

        entities: {},

        get: function (type) {
            var entitiesViewModel = {
                me: this.bot.entity,
                entities: {}
            };

            for (id in this.entities)
                if (type == "organisms" || this.entities[id].type == type) {
                    entitiesViewModel.entities[id] = this.entities[id];
                }

            return entitiesViewModel;
        },

        onMeMoved: function () {
            this.bot.me = this.bot.entity;
        },

        onSpawn: function (e) {
            if (e.type == "player" || e.type == "mob") this.entities[e.id] = e;
        },

        onGone: function (e) {
            if (e.type == "player" || e.type == "mob") delete this.entities[e.id];
        },

        onMoved: function (e) {
            if (e.type == "player" || e.type == "mob") this.entities[e.id] = e;
        },

        makeId: function (e) {
            return e.id;
        }
    };

    return entity;
}
