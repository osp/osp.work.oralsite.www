window.AA = window.AA || {};

(function(undefined) {
    'use strict';
    
    AA.UserModel = Backbone.Model.extend({
        urlRoot: "/pages/api/v1/user/",
        initialize: function() {
            this.fetch();
        },
    });
    
    
    AA.PageModel = Backbone.Model.extend({
        urlRoot: "/pages/api/v1/page/",
        initialize: function() {
            var that = this;
            this.fetch({
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
                        model.set({ slug: AA.router.currentSlug, name : AA.utils.dewikify(AA.router.currentSlug), introduction: '' });
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
            });
        },
    });
    
    
    AA.AnnotationModel = Backbone.Model.extend({
        urlRoot: "/pages/api/v1/annotation/",
        defaults: {
            body: "Nouvelle annotation",
            top: 10,
            left: 10,
            width: 300,
            height: 400,
        },
        initialize: function() {
            if (!this.get('page')) {
                this.set('page', AA.router.pageView.model.url());
            }
        },
    });
    
})();  // end of the namespace AA
