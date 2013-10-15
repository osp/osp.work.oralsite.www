/*
 * TODO: There are no 404’s, an inexisting page will create an empty page to experiment with.
 *       However, there is no way yet to save that page to the server.
 * TODO: Add functionality to create new annotations
 * TODO: When creating a new annotation, and on an unsaved new page, first try to create new page
 * 
 * */

window.AA = window.AA || {};


(function(undefined) {
    'use strict';

    /* Error Handling */
    AA.AlertView = Backbone.View.extend({
        set: function(typeOfError, instructions, traceback) {
            var error = $('.error');
            error
                .html('<h1>' + typeOfError + '</h1>' + '<p>' + instructions + '</p>') // TODO: create template
                .fadeIn()
                .delay(5000)
                .fadeOut();
        }
    });

    AA.UserModel = Backbone.Model.extend({
        urlRoot: "/pages/api/v1/user/",
        initialize: function() {
            this.fetch()
        },
    });

    AA.UserView = Backbone.View.extend({
        el: '#user-meta',
        templates: {
            view: _.template($('#user-view-template').html()),
        },
        render: function() {
            this.$el.html( this.templates.view( this.model.toJSON() ) );
            return this;
        },
        initialize: function() {
            this.listenTo(this.model, 'change', this.render);
        },
    });


    AA.PageModel = Backbone.Model.extend({
        urlRoot: "/pages/api/v1/page/",
        initialize: function() {
            this.fetch({
                error: function(model, response, options) {
                    if (response.status === 404) {
                        AA.alertView.set('Creating a new page', '');
                        // TODO: set default model attributes based on slug
                    }
                },
            });
        },
    });

    AA.PageView = Backbone.View.extend({
        el: '#page-meta',
        templates: {
            view: _.template($('#page-view-template').html()),
        },
        render: function() {
            this.$el.html( this.templates.view( this.model.toJSON() ) );
            /* Because the render function will only fire once the data is fetched,
             * We initialise dependant views here.
             * 
             * The userview is is dependant because we need to know the userId.
             * This view in turn will only render once the needed data is fetched.
             * */
            if (!AA.userView) {
                AA.userModel = new AA.UserModel({id : AA.router.pageView.model.attributes.user });
                AA.userView = new AA.UserView({ model : AA.userModel });
            }
            return this;
        },
        initialize: function() {
            this.listenTo(this.model, 'change', this.render);
            // if we want to already render the template, without the values fetched: this.render();
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
            page: "/pages/api/v1/page/1/", /* TODO: REMOVE, see next TODO */
        }
    });


    AA.AnnotationCollection = Backbone.Collection.extend({
        model: AA.AnnotationModel,
        urlRoot: "/pages/api/v1/annotation/",
        /* TODO we will need a function to create a new annotation
         * To make reference tot theh current page, we can use AA.router.pageView.model.get('resource_uri')
         */
    });


    AA.AnnotationView = Backbone.View.extend({
        tagName: 'section',
        templates: {
            view: _.template($('#annotation-view-template').html()),
            edit: _.template($('#annotation-edit-template').html()),
        },
        editing: false,
        events : {
          'dblclick' : 'toggle',
        },
        initialize: function() {
            this.listenTo(this.model, 'destroy', this.remove);
            
            marked.setOptions({
                timecode: true,
                semanticdata: 'aa',
            });

            this.render();
        },
        render: function() {
            if (this.editing) {
                this.$el
                .html(this.templates.edit({body: this.model.get("body")}));
            } else {
                var model = this.model;
                var body = marked(this.model.get("body"));

                this.$el
                .html(this.templates.view({body: body})).addClass('section1')
                .css({
                    width: this.model.get("width"),
                    height: this.model.get("height"),
                    top: this.model.get("top"),
                    left: this.model.get("left"),
                })
                .resizable({
                    stop: function(event, ui) {
                        model.set({
                            'width': ui.size.width,
                            'height': ui.size.height,
                        }).save();
                    }
                })
                .draggable({
                    stop: function(event, ui) { 
                        model.set({
                            'top': ui.offset.top,
                            'left': ui.offset.left,
                        }).save();
                    }
                });
            };

            return this;
        },

        toggle: function() {
            if (this.editing) {
                this.model.set({
                    'body': $('textarea', this.$el).val()
                }).save();
            };

            this.editing = !this.editing;
            this.render();
        }
    });


    AA.AnnotationCollectionView = Backbone.View.extend({
        collection: new AA.AnnotationCollection(), 
        el: 'article#canvas',
        initialize: function() {
            var that = this;

            this.collection.fetch({
                data : {
                    // filters the annotation list for the current Page at
                    // the API level
                    "page__slug" : this.id
                },
                success: function(result) {
                    that.render();
                },
                error: function(model, response, options) {
                    // The response-text for the error is in JSON (probably a TastyPie specific format)
                    // We parse it.
                    var error = JSON.parse(response.responseText);
                    var errorMessage = error.error_message
                    var traceback = error.traceback
                    AA.alertView.set(errorMessage, traceback);
                }
            });

            this.listenTo(this.collection, 'add', this.renderOne);
        },
        renderOne: function(model, collection) {
            var $el = this.$el;
            var annotationView = new AA.AnnotationView({model: model});
            $el.append(annotationView.el);

            return this;
        },
        render: function() {
            var $el = this.$el;
            $el.empty();
            this.collection.each(function(annotation) {
                var annotationView = new AA.AnnotationView({model: annotation});
                $el.append(annotationView.el);
            });

            return this;
        }
    });

    AA.Router = Backbone.Router.extend({

      routes: {
        ":slug/": "page",
      },

      page: function(slug) {
        console.log(slug);
        // Some more info on Backbone and ‘cleaning up after yourself’: http://mikeygee.com/blog/backbone.html
        this.pageView && this.pageView.remove();
        this.pageView = new AA.PageView({ model: new AA.PageModel({id : slug}) });
        
        this.annotationCollectionView && this.annotationCollectionView.remove();
        this.annotationCollectionView = new AA.AnnotationCollectionView({id : slug});
      },

    });

// end of the namespace:
})();


$(function() {
    var id = 'Index';
    AA.router = new AA.Router();
    AA.alertView = new AA.AlertView();
    Backbone.history.start({pushState: true, root: "/pages/"});
    // TODO: AA.userView = new AA.UserView();
});

$(document).ajaxError(function (e, xhr, options) {
    /* This displays an error message.
     * The error is not actually *caught*,
     * so it keeps showing up in the console */
    if (xhr.status === 401 || xhr.status === 403) {
     AA.alertView.set('Insufficient permissions to save', 'Remember, your changes will not actually be saved when you leave the page');
    }
});
