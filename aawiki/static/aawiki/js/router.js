window.AA = window.AA || {};

(function(undefined) {
    'use strict';
    
    AA.Router = Backbone.Router.extend({
        currentSlug: '',
        routes: {
            ":slug/(:rev/)": "page",
        },
        page: function(slug, rev) {
            this.currentSlug = slug;
            //console.log(slug, document.location.pathname);

            // Some more info on Backbone and ‘cleaning up after yourself’: http://mikeygee.com/blog/backbone.html
            this.pageView && this.pageView.remove();
            this.pageView = new AA.PageView({ model: new AA.PageModel({id : slug, rev: rev}) });

            this.multiplexView && this.multiplexView.remove();
            this.multiplexView = new AA.MultiplexView();
            
            this.annotationCollectionView && this.annotationCollectionView.remove();
            // Since we are using backbone-relational.js, An annotation
            // collection is created as a property of the page view model.
            this.annotationCollectionView = new AA.AnnotationCollectionView({collection : this.pageView.model.get('annotations')});
        }
    });
    
})();  // end of the namespace AA
