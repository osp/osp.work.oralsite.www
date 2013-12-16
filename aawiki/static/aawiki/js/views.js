window.AA = window.AA || {};

(function(undefined) {
    'use strict';

    AA.UserView = Backbone.View.extend({
        id: 'user-meta', // <div id="user-meta"></div>
        templates: {
            view: _.template($('#user-view-template').html()),
        },
        events: {
            "click #login-link"         : "login",
            "submit"                    : "login",
            "keypress input"            : "loginOnEnter",
            "click #logout-link"        : "logout",
        },
        loginOnEnter: function(e) {
        // cf http://japhr.blogspot.be/2011/11/submitting-backbonejs-forms-with-enter.html
            console.log(e.which, e.keyCode);
            if ( e.keyCode === 13 ) { // 13 is the code for ENTER KEY
                this.login(e);
            }
        },
        render: function() {
            this.$el.html( this.templates.view( this.model.toJSON() ) );
            // If the element is not yet part of the DOM:
            if ($('#user-meta').length === 0 ) {
                $('#sidebar').prepend(this.el);
            }
            return this;
        },
        initialize: function() {
            this.listenTo(this.model, 'change', this.render);
        },
        login: function(e) {
            e.preventDefault();
            var data = JSON.stringify({
                username: $("input[name=username]").val(),
                password: $("input[name=password]").val()
            });
            $.ajax({
                url: '/pages/api/v1/user/login/',
                type: 'POST',
                contentType: 'application/json',
                data: data,
                dataType: 'json',
                processData: false,
                success: function(data) { 
                    AA.globalEvents.trigger('aa:changeUser');
                },
            });
        },
        logout: function(e) {
            e.preventDefault();
            $.ajax({
                url: '/pages/api/v1/user/logout/',
                type: 'GET',
                contentType: 'application/json',
                processData: false,
                success: function(data) { 
                    AA.globalEvents.trigger('aa:changeUser');
                },
            });
        }
    });

    AA.PageView = Backbone.View.extend({
        el: '#page-meta',
        templates: {
            view: _.template($('#page-view-template').html()),
        },
        render: function() {
            var context = this.model.toJSON();
            context.introduction = markdown.toHTML(context.introduction, "Aa");
            this.$el.html( this.templates.view( context ) );
            return this;
        },
        initialize: function() {
            this.listenTo(this.model, 'change', this.render);
            // if we want to already render the template, without the values fetched: this.render();
        },
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
            var CreateBtn = AA.widgets.CreateBtn;
            
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

            this.render();
        },
        render: function() {
            if (this.editing) {
                this.$el
                .html(this.templates.edit({body: this.model.get("body")}));
            } else {
                var model = this.model;
                var body = markdown.toHTML(this.model.get("body"), "Aa");
                // DEBUG aa:embed while we don’t have the Markdown:
                // body += '<a href="http://someurl.com/resource.ogv" data-filter="filter1:args|filter2|filter3:args" rel="aa:embed">TheLink</a>';
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
                    },
                    distance: 10
                }).
                renderResources();
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
        el: 'article#canvas .wrapper',
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
            var CreateBtn = AA.widgets.CreateBtn;

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
    
    
})();  // end of the namespace AA
