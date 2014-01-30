window.AA = window.AA || {};

(function(undefined) {
    'use strict';
    
    AA.UserModel = Backbone.Model.extend({
        urlRoot: "/pages/api/v1/user/",
    });
    
    
    AA.PageModel = Backbone.RelationalModel.extend({
        urlRoot: "/pages/api/v1/page/",
        defaults: {
            revisions: []
        },
        relations: [{
            type: Backbone.HasMany,
            key: 'annotations',
            relatedModel: 'AA.AnnotationModel',
            collectionType: 'AA.AnnotationCollection',
            reverseRelation: {
                key: 'page',
                includeInJSON: 'resource_uri'
            }
        }],
    });
    
    
    AA.AnnotationModel = Backbone.RelationalModel.extend({
        urlRoot: "/pages/api/v1/annotation/",
        defaults: {
            body: "Nouvelle annotation",
            top: 10,
            left: 10,
            width: 300,
            height: 400,
        },
        initialize: function() {
            // the annotation belongs to the current page
            if (!this.get('page')) {
                this.set('page', AA.router.pageView.model.url());
            }
        },
    });
    
})();  // end of the namespace AA
