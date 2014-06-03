window.AA = window.AA || {};


(function(undefined) {
    'use strict';


    jsFront(jsyaml);


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
            about: document.location.origin + document.location.pathname, // if the driver is not specified, this annotation is about the current page
            body: "Nouvelle annotation",
            top: 10,
            left: 10,
            width: 300,
            height: 400,
        },
        set: function(attributes, options) {
            // Removes classes that should not be stored
            var excluded = [
                'section1', 
                'ui-resizable', 
                'ui-draggable', 
                'ui-droppable', 
                'focused'
            ].join(' ');

            attributes['klass'] = $('<div>')
                .attr('class', attributes['klass'])
                .removeClass(excluded)
                .attr('class');

            return Backbone.Model.prototype.set.call(this, attributes, options);
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
