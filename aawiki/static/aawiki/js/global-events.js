window.AA = window.AA || {};

(function(undefined) {
    'use strict';
    
    // the globalEvents object allows to setup some events
    // that are common to all Backbone views / models
    // cf: http://lostechies.com/derickbailey/2012/04/03/revisiting-the-backbone-event-aggregator-lessons-learned/
    
    AA.globalEvents = _.extend({}, Backbone.Events);
    
    AA.globalEvents.on('aa:changeUser', function() {
        /*
         * On login and logout we recreate the userview.
         * 
         * We also need to adapt the Page permissions
         * 
         * TODO: annotations might also have to change
         */
        AA.userView && AA.userView.remove();
        AA.userView = new AA.UserView({ model : new AA.UserModel({id : 'me' }) });
        AA.router.pageView.model.unset('permissions');
        AA.router.pageView.model.fetch();
    });
    
    var playChildren = function($annotEl) {
        /**
         * Given an annotation element, play the media elements contained in there.
         * @param {jQuery element} $annotEl - section[typeof='aa:annotation']
         * @returns no return value
         * */
        var hostedUris = $annotEl.find(".embed.hosted").map(function(i, el) {
            return $(el).attr("data-uri");
        }).get();
        var mediaUris = $annotEl.find("video[src],audio[src]").map(function(i, el) {
            return $(el).attr("src");
        }).get();
        var allUris = hostedUris.concat(mediaUris);
        for (var i=0; i<allUris.length; i++) {
            var driver = AA.router.multiplexView.drivers[allUris[i]];
            if (typeof driver !== "undefined" && driver.paused()) {
                driver.play();
            }
        }
    };
    
    
    AA.listeningAnnotations = function() {
        /*
         * In plugins/aa.popcorn.js it is defined that a passed element gets triggered
         * with `start` and `end` events.
         * 
         * In views.js, AnnotationView, updateAnnotationEvents, it is defined that
         * the annotation body looks for annotation elements, and registers them with
         * the associated driver (by default, the page), using the data-begin and data-end
         * properties.
         * 
         * The drivers themselves have been declared in AnnotationView, registerDriver.
         * 
         * Here then, we determine what needs to happen when these start and end events
         * fire.
         */
        $("article#canvas").on("start", "[typeof='aa:annotation']", function(e) {
           $(this).addClass("active");
           playChildren($(this)); // play any audio/videos that are in this annotation
        }).on("end", "[typeof='aa:annotation']", function(e) {
            $(this).removeClass("active");
        });
    };

})();  // end of the namespace AA
