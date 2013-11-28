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

})();  // end of the namespace AA
