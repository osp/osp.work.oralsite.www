window.AA = window.AA || {};

(function(undefined) {
    'use strict';
    
    AA.Router = Backbone.Router.extend({
        currentSlug: '',
        routes: {
            ":slug/": "page",
        },
        page: function(slug) {
            this.currentSlug = slug;
            console.log(slug, document.location.pathname);
            // Some more info on Backbone and ‘cleaning up after yourself’: http://mikeygee.com/blog/backbone.html
            this.pageView && this.pageView.remove();
            this.pageView = new AA.PageView({ model: new AA.PageModel({id : slug}) });
            
            this.annotationCollectionView && this.annotationCollectionView.remove();
            this.annotationCollectionView = new AA.AnnotationCollectionView({id : slug});
        }
    });
    
})();  // end of the namespace AA
