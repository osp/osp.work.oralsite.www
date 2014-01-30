(function(Popcorn) {
    Popcorn.plugin("aa", {
        _setup : function(track) {
        },
        start : function(event, track) {
            track.$el.trigger({
                                  type : "start",
                                  time:   track.start,
                                  driver: this
                              });
        },
        end : function(event, track) {
            track.$el.trigger({
                                  type:   "end",
                                  last:   track._id === _.last(this.getTrackEvents())._id,
                                  time:   track.end,
                                  driver: this
                              });
        }
    });
})(Popcorn);
