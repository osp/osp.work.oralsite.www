(function(Popcorn) {
    Popcorn.plugin("aa", {
        _setup : function(track) {
        },
        start : function(event, track) {
            track.$el.trigger("start");
        },
        end : function(event, track) {
            track.$el.trigger("end");
        }
    });
})(Popcorn);
