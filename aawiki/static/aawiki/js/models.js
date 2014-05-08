window.AA = window.AA || {};


(function(undefined) {
    'use strict';


    AA.SiteModel = Backbone.Model.extend({
        urlRoot: "/pages/api/v1/site/",
    });

    
    AA.UserModel = Backbone.Model.extend({
        urlRoot: "/pages/api/v1/user/",
    });
    
    
    AA.AnnotationModel = Backbone.AssociatedModel.extend({
        urlRoot: "/pages/api/v1/annotation/",
        defaults: {
            title: "Untitled",
            body: "Nouvelle annotation",
            top: 10,
            left: 10,
            width: 300,
            height: 400,
        },
        zIndex: function() {
            var zIndex = $('<div>').attr('style', this.get('style')).css('z-index');
            return zIndex;
        },
        initialize: function() {
            // the annotation belongs to the current page
            if (!this.get('page')) {
                this.set('page', AA.router.pageView.model.url());
            }
        },
    });
    
    
    AA.PageModel = Backbone.AssociatedModel.extend({
        urlRoot: "/pages/api/v1/page/",
        defaults: {
            revisions: [],
            annotations: []
        },
        relations: [{
            type: Backbone.Many,
            key: 'annotations',
            relatedModel: AA.AnnotationModel,
            collectionType: AA.AnnotationCollection,
            reverseRelation: {
                key: 'page',
                includeInJSON: 'resource_uri'
            }
        }],
        prev_rev: function() {
            var current = this.get('rev');  
            var all = this.get('revisions');  
            var prev = null;

            if (current !== null) {
                var index = _.findIndex(all, {id: current})

                if (index + 1 < all.length) {
                    prev = all[index + 1];
                }
            } else {
                if (all) {
                    return all[0];
                }
            }

            return prev;
        },
        next_rev: function() {
            var current = this.get('rev');  
            var all = this.get('revisions');  
            var next = null;

            // We are not looking an old revision so there is no next revision
            if (current !== null) {
                var index = _.findIndex(all, {id: current})

                if (index - 1 >= 0) {
                    next = all[index - 1];
                }
            }

            return next;
        },
        current_rev: function() {
            var current = this.get('rev');  
            var all = this.get('revisions');  
            var rev = null;

            // We are not looking an old revision so there is no next revision
            if (current !== null) {
                rev = _.findWhere(all, {id: current})
            }

            return rev;
        },
    });
})();  // end of the namespace AA
