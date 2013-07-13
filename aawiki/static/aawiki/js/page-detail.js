$(function() {
    window.AnnotationModel = Backbone.Model.extend({
        urlRoot: "/pages/api/v1/annotation/",
        defaults: {
            body: "Nouvelle annotation",
            top: 10,
            left: 10,
            width: 300,
            height: 400,
            page: "/pages/api/v1/page/1/",
        }
    });

    window.AnnotationCollection = Backbone.Collection.extend({
        model: AnnotationModel,
        urlRoot: "/pages/api/v1/annotation/",
    });

    window.AnnotationView = Backbone.View.extend({
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
                }).contextual({
                    propertyName: 'a custom value'
                }).contextual('registerClick', {
                    class: 'icon icon2',
                    title: 'hello, World!',
                    onclick: function(event) {
                        model.destroy();
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

    window.AnnotationCollectionView = Backbone.View.extend({
        el: 'body',
        initialize: function() {
            this.render();
            this.listenTo(this.collection, 'add', this.renderOne);
        },
        renderOne: function(model, collection) {
            var $el = this.$el;
            var annotationView = new AnnotationView({model: model});
            $el.append(annotationView.el);

            return this;
        },
        render: function() {
            var $el = this.$el;
            $el.empty();
            this.collection.each(function(annotation) {
                var annotationView = new AnnotationView({model: annotation});
                $el.append(annotationView.el);
            });

            return this;
        }
    });

    window.annotationCollection = new AnnotationCollection({page: "/pages/api/v1/page/1/"});
    annotationCollection.fetch({
        success: function(result) {
            window.annotationCollectionView = new AnnotationCollectionView({collection: annotationCollection});
        },
    });



    $('body').contextual({
        propertyName: 'a custom value'
    });

    $('body').contextual('registerClick', {
        class: 'icon icon4',
        title: 'hello, World!',
        onclick: function(event) {
            annotationCollection.create({top: event.pageY, left: event.pageX});
        }
    });
});
