window.AA = window.AA || {};


(function(undefined) {
    'use strict';

    /* Error Handling */
    AA.AlertView = Backbone.View.extend({
        set: function(typeOfError, traceback) {
            var error = $('.error');
            error
                .html('<h1>' + typeOfError + '</h1>' + '<pre>' + traceback + '</pre>') // TODO: create template
                .fadeIn()
        }
    });

    AA.AnnotationModel = Backbone.Model.extend({
        urlRoot: "/pages/api/v1/annotation/",
        defaults: {
            body: "Nouvelle annotation",
            top: 10,
            left: 10,
            width: 300,
            height: 400,
            page: "/pages/api/v1/page/1/", /* TODO: needs to be a function that returns the link to the current page */
        }
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
        collection: new AA.AnnotationCollection({page: "/pages/api/v1/page/1/"}),
        el: 'body',
        initialize: function() {
            var that = this;

            this.collection.fetch({
                data : {
                    // filters the annotation list for the current Page at
                    // the API level
                    "page" : 1
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

// end of the namespace:
})();


$(function() {
    AA.alertView = new AA.AlertView();
    // TODO: AA.pageView = new AA.PageView();
    // TODO: AA.userView = new AA.UserView();
    AA.annotationCollectionView = new AA.AnnotationCollectionView();
});
