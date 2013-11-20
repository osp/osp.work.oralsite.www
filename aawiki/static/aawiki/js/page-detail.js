/*
 * TODO: When creating a new annotation, and on an unsaved new page, first try to create new page
 * 
 * */

window.AA = window.AA || {};


(function(undefined) {
    'use strict';


    /**
     * Button factory for contextual menus
     * TODO: move in a more appropriate place
     */
    var CreateBtn = function(options) {
        var defaults = {
            title: 'undefined',
            class: ''
        };

        var options = $.extend({}, defaults, options);

        var btn = $('<div>')
        .attr({
            title: options.title,
            draggable: false,
            class: 'icon ' + options.class
        });

        return btn;
    };


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
            var that = this;
            this.fetch({
                error: function(model, response, options) {
                    if (response.status === 404) {
                        AA.alertView.set('Creating a new page', '');
                        /* Unset the id so that Backbone will not try to post to
                         * the post url, but instead to the API endpoint.
                         * 
                         * Pass silent to not trigger a redraw */
                        model.unset('id', { silent: true })
                        /* We set the model’s name and slug based on the page’s uri
                         * */
                        model.set({ slug: AA.router.currentSlug, name : AA.utils.dewikify(AA.router.currentSlug) })
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


    AA.PageView = Backbone.View.extend({
        el: '#page-meta',
        templates: {
            view: _.template($('#page-view-template').html()),
        },
        render: function() {
            this.$el.html( this.templates.view( this.model.toJSON() ) );
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
        },
        initialize: function() {
            if (!this.get('page')) {
                this.set('page', AA.router.pageView.model.url());
            }
        },
    });


    AA.AnnotationCollection = Backbone.Collection.extend({
        model: AA.AnnotationModel,
        urlRoot: "/pages/api/v1/annotation/",
    });


    AA.AnnotationView = Backbone.View.extend({
        tagName: 'section',
        templates: {
            view: _.template($('#annotation-view-template').html()),
            edit: _.template($('#annotation-edit-template').html()),
        },
        editing: false,
        onPositionChange: function(model, value, options) {
            var defaults = {
                animate: false
            };
            var options = $.extend({}, defaults, options);

            if (options.animate === true) {
                this.$el.animate({
                    left: model.changed.left,
                    top: model.changed.top
                }, 2000, 'easeOutExpo');
            };
        },
        deleteAnnotation: function(event) {
            if (window.confirm('This will permanently delete this annotation. Proceed?')) {
                this.$el.contextual('hide');
                this.model.destroy();
            };
            return false;
        },
        exportAnnotationToAudacityMarkers: function(event) {
            window.open(this.model.id + '?format=audacity');

            return false;
        },
        importAnnotationFromAudacityMarkers: function(event) {
            window.open('/annotations/' + this.model.get('id') + '/update/', '', "status=yes, height=500; width=500; resizeable=0");
                
            return false;
        },
        initialize: function() {
            this.listenTo(this.model, 'destroy', this.remove);
            this.listenTo(this.model, 'change:top change:left', this.onPositionChange);

            this.$el.contextual({iconSize: 40, iconSpacing: 5});

            // Edit Annotation Button
            var btn = CreateBtn({title: 'edit annotation', class: 'icon7'})
                .on('click', this.toggle.bind(this));
            this.$el.contextual('register', 'click', 'left', btn);

            // Delete Annotation Button
            var btn = CreateBtn({title: 'delete annotation', class: 'icon6'})
                .on('click', this.deleteAnnotation.bind(this));
            this.$el.contextual('register', 'click', 'left', btn);

            // Export to Audacity Button
            var btn = CreateBtn({title: 'export annotation to audacity markers', class: 'icon8'})
                .on('click', this.exportAnnotationToAudacityMarkers.bind(this));
            this.$el.contextual('register', 'click', 'left', btn);

            // Import from Audacity Button
            var btn = CreateBtn({title: 'import annotation from audacity markers', class: 'icon8'})
                .on('click', this.importAnnotationFromAudacityMarkers.bind(this));
            this.$el.contextual('register', 'click', 'left', btn);

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
        addAnnotation: function(event) {
            console.log(this);
            var offsetBtn = $(event.currentTarget).position();
            var offsetCanvas = this.$el.position();
            var top = offsetBtn.top - offsetCanvas.top;
            var left = offsetBtn.left - offsetCanvas.left;
            this.collection.create({top: top, left: left});
            this.$el.contextual('hide');

            return false;
        },
        organizeAnnotations: function (event) {
            this.collection.each(function(model, index) {
                model.set({
                    'left': 20 + (index * 20),
                    'top': 20 + (index * 20),
                }, {animate: true}).save();
            });

            return false;
        },
        initialize: function() {
            var that = this;

            this.$el.contextual({iconSize: 40, iconSpacing: 5});

            // Create Annotation Button
            var btn = CreateBtn({title: 'new annotation', class: 'icon5'})
                .on('click', this.addAnnotation.bind(this));
            this.$el.contextual('register', 'click', 'cursor', btn);

            // Create Toggle grid Button (doing nothing at the moment)
            var btn = CreateBtn({title: 'toggle grid', class: 'icon2'})
                .on('click', function(event) { return false; });
            this.$el.contextual('register', 'click', 'cursor', btn);
                
            // Create Change grid Button (doing nothing at the moment)
            var btn = CreateBtn({title: 'change grid', class: 'icon3'})
                .on('click', function(event) { return false; });
            this.$el.contextual('register', 'click', 'cursor', btn);

            // Create Organize annotations Button
            var btn = CreateBtn({title: 'organize annotations', class: 'icon1'})
                .on('click', this.organizeAnnotations.bind(this));
            this.$el.contextual('register', 'click', 'cursor', btn);

            this.collection.fetch({
                data : {
                    // filters the annotation list for the current Page at
                    // the API level
                    "page__slug" : this.id
                },
                success: function(result) {
                    that.render();
                },
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


$(function() {
    AA.router = new AA.Router();

    AA.userModel = new AA.UserModel({id : 'me' });
    AA.userView = new AA.UserView({ model : AA.userModel });

    AA.alertView = new AA.AlertView();

    Backbone.history.start({pushState: true, root: "/pages/"});
});

$(document).ajaxError(function (e, xhr, options) {
    /* This displays an error message.
     * The error is not actually *caught*,
     * so it keeps showing up in the console */
    if (xhr.status === 401 || xhr.status === 403) {
        AA.alertView.set('Insufficient permissions to save', 'Remember, your changes will not actually be saved when you leave the page');
    } else if (xhr.status === 500) {
        /* The response-text for the error is in JSON (probably a TastyPie specific format)
           We parse it. */
        var error = JSON.parse(xhr.responseText);
        var errorMessage = error.error_message;
        var traceback = error.traceback;
        AA.alertView.set(errorMessage, traceback);
    }
});
