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
            if ( e.keyCode === 13 ) { // 13 is the code for ENTER KEY
                this.login(e);
            }
        },
        render: function() {
            this.$el.html( this.templates.view( this.model.toJSON() ) );
            // If the element is not yet part of the DOM:
            if ($('#user-meta').length === 0 ) {
                $('#user-meta-container').prepend(this.el);
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
        id: 'page-meta', // <div id="page-meta"></div>
        templates: {
            view: _.template($('#page-view-template').html()),
        },
        render: function() {
            var context = this.model.toJSON();
            context.introduction = markdown.toHTML(context.introduction, "Aa");
            this.$el.html( this.templates.view( context ) );

            // If the element is not yet part of the DOM:
            if ($('#page-meta').length === 0 ) {
                $('#page-meta-container').prepend(this.el);
            }

            return this;
        },
        initialize: function() {
            this.listenTo(this.model, 'change', this.render);
            // if we want to already render the template, without the values fetched: this.render();
        },
    });

    AA.MultiplexView = Backbone.View.extend({
        initialize: function() {
            this.drivers = {};
        },
        registerDriver : function(uri) {
            if (typeof(this.drivers[uri]) === 'undefined') {
                
                if (uri === document.location.origin + document.location.pathname) {
                    // If the about is the current page, attach to the general timeline
                    this.drivers[uri] = Popcorn.baseplayer( "#baseplayer" );
                } 
                else if (uri.indexOf(document.location.origin + document.location.pathname) !== -1 && uri.indexOf('#') !== -1 ) {
                    // example uri: http://localhost:8000/pages/tests/#annotation-0024
                    // If the about refers to a part of the page, we try to create
                    // a separate abstract player for that part
                    var hash = '#' + uri.split('#').slice(-1);
                    if ($(hash).length === 0) {
                        return null;
                    }
                    this.drivers[uri] = Popcorn.baseplayer( hash );

                } else {
                    // we assume that the driver is a media element we can manipulate
                    // such as <video class="player" controls="" preload="" src="http://localhost:8000/static/components/popcorn-js/test/trailer.ogv"></video>
                    var driverMediaEl  = document.querySelector('[src="' + uri + '"]');
                    var driverMediaRef = document.querySelector('[data-uri="' + uri + '"]');
                    if (driverMediaEl &&
                           ( driverMediaEl.tagName.toLowerCase() === "video" ||
                             driverMediaEl.tagName.toLowerCase() === "audio" )
                           ) {
                        this.drivers[uri] = Popcorn(driverMediaEl);
                    } else if (driverMediaRef) {
                        // TODO: Popcorn now uses Popcorn.youtube instead of Popcorn.smart
                        // To fix this, we need to insert unique id´s in the embed wrappers,
                        // because Popcorn.smart only supports id´s and not elements themselves.
                        this.drivers[uri] = Popcorn.youtube(driverMediaRef, uri);
                    } else {
                            
                        // And else we don’t know what to do
                        return null;
                    }
                }
                return this.drivers[uri];
            } else {
                // already registered, just return it
                return this.drivers[uri];
            }
        }
    });

    AA.AnnotationView = Backbone.View.extend({
        /**
         * For the Popcorn player API,
         * see: https://gist.github.com/boazsender/729213
         * */
        tagName: 'section',
        templates: {
            view: _.template($('#annotation-view-template').html()),
            edit: _.template($('#annotation-edit-template').html()),
        },
        events: {
            "click .play"               : "play",
        },
        play: function(e) {
            /**
             * Sends a ‘play’ event to the annotation’s driver.
             * 
             * We should implement a full HTML5 player interface.
             * 
             * (The Popcorn instance wraps the HTML5 audio/video player,
             *  so it shares the same base methods)
             *  */
            AA.router.multiplexView.drivers[this.model.get('about')].play();
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
            // the annotation can be about any element on the page,
            // however is this is not specified, it is about the current page
            if (!this.model.get('about')) {
                // this will give us the uri sans the #hash
                this.model.set('about', document.location.origin + document.location.pathname);
            }
            
            this.driverEventIDs = [];
            
            var CreateBtn = AA.widgets.CreateBtn;
            
            this.listenTo(this.model, 'destroy', this.remove);
            this.listenTo(this.model, 'change:top change:left', this.onPositionChange);

            this.$el.contextual({iconSize: 40, iconSpacing: 5});

            // Edit Annotation Button
            var btn = CreateBtn({title: 'edit annotation', class: 'icon7'})
                .on('click', this.toggle.bind(this));
            this.$el.contextual('register', 'dblclick', 'left', btn);

            // Delete Annotation Button
            var btn = CreateBtn({title: 'delete annotation', class: 'icon6'})
                .on('click', this.deleteAnnotation.bind(this));
            this.$el.contextual('register', 'dblclick', 'left', btn);

            // Export to Audacity Button
            var btn = CreateBtn({title: 'export annotation to audacity markers', class: 'icon8'})
                .on('click', this.exportAnnotationToAudacityMarkers.bind(this));
            this.$el.contextual('register', 'dblclick', 'left', btn);

            // Import from Audacity Button
            var btn = CreateBtn({title: 'import annotation from audacity markers', class: 'icon8'})
                .on('click', this.importAnnotationFromAudacityMarkers.bind(this));
            this.$el.contextual('register', 'dblclick', 'left', btn);

            this.render();
            
            this.listenTo(AA.globalEvents, "aa:newDrivers", this.registerDriver, this);
            this.listenTo(AA.globalEvents, "aa:newDrivers", this.registerChildrenAsDrivers, this);
        },
        registerDriver : function() {
            /**
             * This annotation has an `about` value. It represents what is annotated,
             * also called the ‘driver’ because this time based resource can trigger
             * time-based behaviour in the annotations.
             * 
             * With this time-based resource we initialise the driver,
             * if it has not yet been initialised, and we call the function to register
             * the annotations as events.
             */
            this.driver = AA.router.multiplexView.registerDriver(this.model.get('about'));
            this.updateAnnotationEvents();
        },
        registerChildrenAsDrivers: function() {
            
            var hostedUris = this.$el.find(".embed.hosted").map(function(i, el) {
                return $(el).attr("data-uri");
            }).get();
            var mediaUris = this.$el.find("video[src],audio[src]").map(function(i, el) {
                return $(el).attr("src");
            }).get();
            var allUris = hostedUris.concat(mediaUris);
            for (var i=0; i<allUris.length; i++) {
                AA.router.multiplexView.registerDriver(allUris[i]);
            }
        },
        deleteAnnotationEvents: function() {
            /**
             * Delete all references to annotations at this annotation’s driver. 
             */
            for (var i=0; i<this.driverEventIDs.length; i++) {
                var eventID = this.driverEventIDs[i];
                this.driver.removeTrackEvent( eventID );
            }
            this.driverEventIDs = [];
        },
        updateAnnotationEvents: function() {
            /**
             * Scan the contents of the annotation view: parse out all annotations,
             * and register them with the driver.
             * 
             * This is rerun every time the content changes (with the old events
             * emptied out beforehand) 
             */
            if (!this.driver) {
                return false;
            }
            var that = this;
            this.deleteAnnotationEvents();
            this.$el.find("[typeof='aa:annotation']").each(function (i, el) {
                 var $annotation = $(el);
                 var begin = AA.utils.timecodeToSeconds($annotation.attr("data-begin"));
                 var end   = AA.utils.timecodeToSeconds($annotation.attr("data-end"));
                 var p = that.driver.aa({
                     start: begin,
                     end: end,
                     $el: $annotation
                 });
                 that.driverEventIDs.push(p.getLastTrackEventId());
             });
        },
        hasPlay : function() {
            /** 
             * Should this annotation feature player controls?
             * 
             * In most cases, yes, but not if the driver of the annotation is
             * the page itself. In this case, there will be general player controls
             * located elsewhere.
             * */
            return this.model.get('about') !== document.location.origin + document.location.pathname;
        },
        render: function() {
            if (this.editing) {
                this.$el
                .html(this.templates.edit({body: this.model.get("body")}));
            } else {
                var model = this.model;
                var body = typogr.typogrify(markdown.toHTML(this.model.get("body"), "Aa"));

                this.$el
                .html(this.templates.view({
                    body:    body,
                    hasPlay: this.hasPlay(),
                    about:   this.model.get('about')
                }))
                .addClass('section1')
                .attr('id', 'annotation-' + AA.utils.zeropad( this.model.attributes.id, 4 )) // id="annotation-0004"
                .attr('about', this.model.attributes.about)
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
                
                if(this.driver) {
                    this.updateAnnotationEvents();
                }
                this.registerChildrenAsDrivers();
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
            this.$el.contextual('register', 'dblclick', 'cursor', btn);

            // Create Toggle grid Button (doing nothing at the moment)
            var btn = CreateBtn({title: 'toggle grid', class: 'icon2'})
                .on('click', function(event) { return false; });
            this.$el.contextual('register', 'dblclick', 'cursor', btn);
                
            // Create Change grid Button (doing nothing at the moment)
            var btn = CreateBtn({title: 'change grid', class: 'icon3'})
                .on('click', function(event) { return false; });
            this.$el.contextual('register', 'dblclick', 'cursor', btn);

            // Create Organize annotations Button
            var btn = CreateBtn({title: 'organize annotations', class: 'icon1'})
                .on('click', this.organizeAnnotations.bind(this));
            this.$el.contextual('register', 'dblclick', 'cursor', btn);

            this.listenTo(this.collection, 'add', this.renderOne);

            this.render();
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

            AA.globalEvents.trigger('aa:newDrivers');
            return this;
        }
    });
})();  // end of the namespace AA

// vim: set foldmethod=indent:
