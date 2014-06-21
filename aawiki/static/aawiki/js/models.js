window.AA = window.AA || {};


(function(undefined) {
    'use strict';


    jsFront(jsyaml);


    Backbone.Model.prototype.reset = function() {
        this.clear().set(this.defaults);

        return this;
    };


    AA.SiteModel = Backbone.Model.extend({
        urlRoot: "/api/v1/site/",
    });

    
    AA.UserModel = Backbone.Model.extend({
        urlRoot: "/api/v1/user/",
        defaults: {
            id: "me"
        },
        initialize: function() {
            this.listenTo(AA.globalEvents, 'aa:changeUser', this.onChangeUser);
        },
        onChangeUser: function() {
            this.reset().fetch()
        },
        loggedIn: function() {
            return this.get("id") !== -1 && this.get("id") !== 'me'; // it’s `me` when the app first tries to find out who the user is: the backend returns the real id
        },
    });
    
    
    AA.AnnotationModel = Backbone.AssociatedModel.extend({
        urlRoot: "/api/v1/annotation/",
        defaults: {
            title: "Untitled",
            about: document.location.origin + document.location.pathname, // if the driver is not specified, this annotation is about the current page
            body: "Nouvelle annotation",
            style: 'width: 300px; height: 400px; top: 10px; left: 10px;'
        },
        loadFront: function (src, name) {
            name = name || '__content';

            var data = jsyaml.loadFront(src, name);

            data['klass'] = data['class'];
            delete data['class'];

            this.set(data);

            return this;
        },
        toFrontMatter: function() {
            var data = this.toJSON({noalias: true});
            var body = data['body'].replace(/^(\r\n\n|\n|\r)+|(\r\n|\n|\r)+$/g, '');

            data['class'] = data.klass;
            delete data.klass;

            delete data.body;
            delete data.page;
            delete data.resource_uri;
            delete data.id;
            delete data.pk;

            var output = "---\n";
            output += jsyaml.dump(data, 4);
            output += "---\n\n";
            output += body;

            return output;
        },
        zIndex: function() {
            var zIndex = parseInt($('<div>').attr('style', this.get('style')).css('z-index'), 10) || 0;
            return zIndex;
        },
        initialize: function() {
            // the annotation belongs to the current page
            if (!this.get('page')) {
                this.set('page', AA.router.pageView.model.url());
            }
            if (!this.get('about')) {
                this.set("about", document.location.href);
            }
        },
    });
    
    
    AA.PageModel = Backbone.AssociatedModel.extend({
        urlRoot: "/api/v1/page/",
        defaults: {
            revisions: [],
            annotations: [],
            introduction: ""
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
        initialize: function() {
            this.on('error', this.onError);
        },
        onError: function(model, response, options) {
            // Redirects to the current version if a wrong revision is passed
            if (response.status === 404 && this.get('rev')) {
                AA.router.navigate('/' + AA.router.currentSlug + '/');
            } else if (response.status === 404) {
                AA.alertView.set('Creating a new page', '');
                /* Unset the id so that Backbone will not try to post to
                    * the post url, but instead to the API endpoint.
                    * 
                    * Pass silent to not trigger a redraw */
                model.unset('id', { silent: true });
                /* We set the model’s name and slug based on the page’s uri
                    * */
                model.set({
                    slug:         AA.router.currentSlug,
                    name:         AA.utils.dewikify(AA.router.currentSlug),
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
        toFrontMatter: function() {
            var data = this.toJSON();
            var introduction = data['introduction'].replace(/^(\r\n\n|\n|\r)+|(\r\n|\n|\r)+$/g, '');

            data['class'] = data.klass;
            delete data.klass;

            delete data.introduction;
            delete data.permissions;
            delete data.rev;
            delete data.annotations;
            delete data.id;
            delete data.revisions;
            delete data.resource_uri;
            delete data.slug;

            var output = "---\n";
            output += jsyaml.dump(data, 4);
            output += "---\n\n";
            output += introduction;

            return output;
        },
        loadFront: function (src, name) {
            name = name || '__content';

            var data = jsyaml.loadFront(src, name);

            data['klass'] = data['class'];
            delete data['class'];

            this.set(data);

            return this;
        },
        commit: function(msg) {
            // for now just saves the full model
            // This could be interesting:
            // http://stackoverflow.com/questions/20668911/backbone-js-saving-a-model-with-header-params
            this.save(null, {
                headers: {
                    Message: msg
                }
            });
        },
        prev_rev: function() {
            var current = this.get('rev');  
            var all = this.get('revisions');  
            var prev = null;

            if (current !== null) {
                var index = _.findIndex(all, {id: current});

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
                var index = _.findIndex(all, {id: current});

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
                rev = _.findWhere(all, {id: current});
            }

            return rev;
        },
    });
})();  // end of the namespace AA
