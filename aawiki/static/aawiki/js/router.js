window.AA = window.AA || {};

(function(undefined) {
    'use strict';
    
    AA.Router = Backbone.Router.extend({
        currentSlug: '',
        routes: {
            ":slug/(:rev/)": "page",
        },
        page: function(slug, rev) {
            var that = this;
            this.currentSlug = slug;
            this.pageModel = this.pageModel || new AA.PageModel();
            this.pageModel.set({id : slug, rev: rev});

            // Some more info on Backbone and ‘cleaning up after yourself’: http://mikeygee.com/blog/backbone.html
            this.pageView && this.pageView.remove();
            this.pageView = new AA.PageView({ model: this.pageModel });
            this.pageView.model.fetch({
                data: {
                    rev: rev
                },
                error: function(model, response, options) {
                    if (response.status === 404) {
                        AA.alertView.set('Creating a new page', '');
                        /* Unset the id so that Backbone will not try to post to
                         * the post url, but instead to the API endpoint.
                         * 
                         * Pass silent to not trigger a redraw */
                        model.unset('id', { silent: true });
                        /* We set the model’s name and slug based on the page’s uri
                         * */
                        model.set({
                            slug:         AA.utils.wikify(AA.router.currentSlug),
                            name:         AA.utils.dewikify(AA.router.currentSlug),
                            introduction: ''
                        });

                        /* We save. The API returns the newly created object,
                         * which also contains the appropriate permissions,
                         * created on the server-side.
                         * 
                         * Backbone automagically synchronises.
                         * 
                         * TODO: defer page creation to moment the first annotation is created (not easy)
                         */
                        model.save(); 
                    }
                },
                success : function() {
                    //console.log(that.pageModel)
                }
            });

            this.multiplexView && this.multiplexView.remove();
            this.multiplexView = new AA.MultiplexView();
            
            // empty() is a custom method acting like remove() except that it
            // doesn't remove the container
            this.annotationCollectionView && this.annotationCollectionView.empty();
            // Since we are using backbone-associations.js, An annotation
            // collection is created as a property of the page view model.
            this.annotationCollectionView = new AA.AnnotationCollectionView({collection : this.pageView.model.get('annotations')});

            this.revisionView && this.revisionView.empty();
            this.revisionView = new AA.RevisionView({ model: this.pageModel });
            
            this.timelinePlayerView && this.timelinePlayerView.remove();
            this.timelinePlayerView = new AA.TimelinePlayerView();

            this.userCollection = new AA.UserCollection();
            this.userCollection.fetch();
        }
    });
    
})();  // end of the namespace AA
