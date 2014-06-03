window.AA = window.AA || {};

(function(undefined) {
    'use strict';
    
    AA.UserCollection = Backbone.Collection.extend({
        model: AA.UserModel,
        urlRoot: "/pages/api/v1/user/",
    });

    
    AA.AnnotationCollection = Backbone.Collection.extend({
        model: AA.AnnotationModel,
        urlRoot: "/pages/api/v1/annotation/",
    });
})();  // end of the namespace AA

