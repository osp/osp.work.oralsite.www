window.AA = window.AA || {};

(function(undefined) {
    'use strict';

    AA.SiteView = Backbone.View.extend({
        id: 'site-meta', // <div id="user-meta"></div>
        templates: {
            view: _.template($('#site-view-template').html()),
        },
        initialize: function() {
            this.listenTo(this.model, 'change', this.render);
            // if we want to already render the template, without the values fetched: this.render();
        },
        render: function() {
            var context = this.model.toJSON();
            this.$el.html( this.templates.view( context ) );

            // If the element is not yet part of the DOM:
            if ($('#site-meta').length === 0 ) {
                $('#site-meta-container').prepend(this.el);
            }

            return this;
        },
    });
    
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
        },
    });

    AA.PageView = Backbone.View.extend({
        id: 'page-meta', // <div id="page-meta"></div>
        templates: {
            view: _.template($('#page-view-template').html()),
        },
        events: {
            "click #toggleDrawer"       : "toggleDrawer",
            "click #commit"             : "commit",
            //"click #commit-list a": "wayback"
        },
        toggleDrawer: function(event) {
            $('#sidebar, #canvas').toggleClass('hide');
        },
        //wayback: function(event) {
            //event.preventDefault();
            //var href = $(event.currentTarget).attr('href');
            //AA.router.navigate(href, {trigger: true});
        //},
        commit: function(event) {
            var msg = prompt("Commit message", "My modifications");
            // for now just saves the full model
            // This could be interesting:
            // http://stackoverflow.com/questions/20668911/backbone-js-saving-a-model-with-header-params
            this.model.save(null, {
                headers: {
                    Message: msg
                }
            });
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
                        // We go to lengths to specify id’s,
                        // because Popcorn.smart only supports id´s and not elements themselves.
                        this.drivers[uri] = Popcorn.smart('#' + driverMediaRef.getAttribute('id'), uri);
                    } else {
                            
                        // And else we don’t know what to do
                        return null;
                    }
                }
                if (this.drivers[uri] instanceof Popcorn && !(/(?:http:\/\/www\.|http:\/\/|www\.|\.|^)(youtu)/).test( uri ) ) {
                    // Sent out time update events to our Backbone event funnel
                    // FIXME: Disabled this now for Youtube drivers as for some reason or another they emit events continuously
                    // maybe a bug upstream?
                    // TODO: Disabled this now in general as the timeUpdate functions clash with the previous next functionality
                    // this.drivers[uri].on("timeupdate", function() {
                    //     AA.globalEvents.trigger('aa:timeUpdate', uri);
                    // });

                    /* Adding the appropriate classes to the miniplayers based on pause and play events */
                    // I’m not sure this is the right way to go about this:
                    var miniPlayerPlayUI = function() {
                        $('.mini-player[rel="' + uri + '"]').removeClass("paused").addClass("playing");
                    };
                    var miniPlayerPauseUI = function() {
                        $('.mini-player[rel="' + uri + '"]').removeClass("playing").addClass("paused");
                    };
                    this.drivers[uri].on("play", miniPlayerPlayUI).on("playing", miniPlayerPlayUI);
                    this.drivers[uri].on("pause", miniPlayerPauseUI).on("ended", miniPlayerPauseUI).on("abort", miniPlayerPauseUI);
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
         * This is the workhorse of OLGA
         *
         * Each annotation is connected to a driver.
         * This driver can be a sound, a video, the page, or the annotation itself.
         *
         * The view takes care of quite some different actions.
         *
         * 1) It renders Markdown content, and allows it to be edited
         * 2) In this Markdown content, one can embed time based annotations
         * 3) The view keeps track of the timed annotations, and registers them
         *    with the corresponding driver in the MultiPlexView
         *    It reruns this process when the Markdown content is updated.
         * 4) The view has a series of controls to play and scroll through
         *    the corresponding driver.
         *
         * The driver where the events are registered is a PopCorn instance.
         * For the Popcorn player API,
         * see: https://gist.github.com/boazsender/729213
         *
         * */
        tagName: 'section',
        templates: {
            view: _.template($('#annotation-view-template').html()),
            edit: _.template($('#annotation-edit-template').html()),
            player: _.template($('#annotation-player-template').html())
        },
        events: {
            "click .controls .play"     : "playPause",
            "click .next"               : "next",
            "click .previous"           : "previous",            
            "dblclick"                  : "toggleEditMenu",
            "click .mini-player"         : "playPauseMiniPlayer"
        },
        initialize: function() {
            // if the driver is not specified, this annotation is about the current page
            if (!this.model.get('about')) {
                // this will give us the uri sans the #hash
                this.model.set('about', document.location.origin + document.location.pathname);
            }

            // references to timed annotations
            this.driverEventIDs = [];

            // local events
            this.listenTo(this.model, 'destroy', this.remove);
            this.listenTo(this.model, 'change:top change:left', this.onPositionChange);

	        // global events
            this.listenTo(AA.globalEvents, "aa:newDrivers", this.registerDriver, this);
            this.listenTo(AA.globalEvents, "aa:newDrivers", this.registerChildrenAsDrivers, this);
            this.listenTo(AA.globalEvents, "aa:timeUpdate", this.renderPlayerConditionally, this);

            // setup the contextual menu with editing options
            this.editMenu = new AA.widgets.Menu ({iconSize: 40, iconSpacing: 5, position: 'left', element: this.el});
            this.editMenu.register ([
                // Edit Annotation Button
                new AA.widgets.MenuButton({title: 'edit annotation', class: 'icon7'})
                    .on('click', this.toggle.bind(this)),
               // Delete Annotation Button
                new AA.widgets.MenuButton({title: 'delete annotation', class: 'icon6'})
                    .on('click', this.deleteAnnotation.bind(this)),
                // Export to Audacity Button
                new AA.widgets.MenuButton({title: 'export annotation to audacity markers', class: 'icon8'})
                    .on('click', this.exportAnnotationToAudacityMarkers.bind(this)),
                // Import from Audacity Button
                new AA.widgets.MenuButton({title: 'import annotation from audacity markers', class: 'icon8'})
                    .on('click', this.importAnnotationFromAudacityMarkers.bind(this)),
                // Set About Value Button
                new AA.widgets.MenuButton({title: 'set about value', class: 'icon8'})
                    .on('click', this.setAbout.bind(this)),
                // Set as slideshow (changes about value)
                new AA.widgets.MenuButton({title: 'set as slideshow', class: 'icon8'})
                    .on('click', this.setAsSlideshow.bind(this)),
            ]);

            this.render();


        },
        toggleEditMenu: function(e) {
            this.editMenu.toggle(e);
            
            e.cancelBubble = true;
            if (e.stopPropagation) e.stopPropagation();
        },
        editing: false,
        onPositionChange: function(model, value, options) {
            var defaults = {
                animate: false
            };
           
            var options = $.extend({}, defaults, options);
            var that = this;
            
            if (options.animate === true) {
                this.$el.animate({
                    left: model.changed.left,
                    top: model.changed.top
                }, {
                    duration: 2000,
                    easing: 'easeOutExpo',
                    progress: function () { that.editMenu.redraw(); }
                });
            };
            
            this.editMenu.redraw ();
        },
        toggle: function() {
            if (this.editing) {
                this.model.set({
                    'body': $('textarea', this.$el).val()
                }).save();
            };

            this.editing = !this.editing;
            this.render();
        },
        deleteAnnotation: function(event) {
            if (window.confirm('This will permanently delete this annotation. Proceed?')) {
                this.editMenu.destroy();
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
        setAbout: function() {
        	var aboutPrompt = prompt("The about value", this.model.get("about"));
        	this.model.set("about", aboutPrompt);
        	this.model.save();
			this.render();
			this.renderPlayer();
        	return false;
        },
        setAsSlideshow: function() {
            if (window.confirm('Set as slideshow?')) {
        		this.model.set("about", document.location.origin + document.location.pathname + '#' + 'annotation-' + AA.utils.zeropad( this.model.attributes.id, 4) );
			}
			this.model.save();
			this.render();
			this.renderPlayer();
        	return false;
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
                 var start = AA.utils.timecodeToSeconds($annotation.attr("data-begin"));

                 // work around Popcorn bug where 0 second events are not triggered
                 // we trigger it manually
                 if (start === 0 && that.driver.paused() && that.driver.currentTime() === 0) {
                      $annotation.trigger({
                          type : "start"
                      });
                 }

                 var end   = AA.utils.timecodeToSeconds($annotation.attr("data-end"));
                 var p = that.driver.aa({
                     start: start,
                     end: end,
                     $el: $annotation
                 });
                 that.driverEventIDs.push(p.getLastTrackEventId());
             });
             this.renderPlayer();
        },
        hasPlay : function() {
            /**
             * Should this annotation feature player controls?
             *
             * For now we only feature player controls for self-driven annotations, i.e. slideshows.
             * */
            var uri = this.model.get('about');
            return uri.indexOf(document.location.origin + document.location.pathname) !== -1 && uri.indexOf('#') !== -1 ;
        },
        isSlideshow: function() {
            // for now the same as hasPlay
            return this.hasPlay();
        },
        playPause: function(e) {
            /**
             * Sends a ‘play’ event to the annotation’s driver.
             *
             * We should implement a full HTML5 player interface.
             *
             * (The Popcorn instance wraps the HTML5 audio/video player,
             *  so it shares the same base methods)
             *  */
            if (this.driver.paused()) {
                this.driver.play();
                e.target.textContent = "‖";
            } else {
                this.driver.pause();
                e.target.textContent = "▶";
            }
        },
        playPauseMiniPlayer: function(e) {
            var miniPlayerDriver = AA.router.multiplexView.drivers[$(e.target).attr("rel")];
            if (miniPlayerDriver.paused()) {
                miniPlayerDriver.play();
            } else {
                miniPlayerDriver.pause();
            }
        },
        stopCurrentEvent: function() {
        	this.$el.find("*[typeof='aa:annotation'].active").trigger("end");
        },
        nextEvent: function() {
            var currentTime = this.driver.currentTime();
            var sortedEvents = _.sortBy(this.driver.getTrackEvents(), "start");
            // returns undefined if no such element encountered:
            return _.find(sortedEvents, function(event){ return currentTime < event.start; });
        },
        next: function(e) {
            var nextEvent = this.nextEvent();
            if (nextEvent) {
            	this.stopCurrentEvent();
                this.driver.currentTime(nextEvent.start);
                this.renderPlayer();
            }
        },
        previousEvent: function() {
            var currentTime = this.driver.currentTime();
            var sortedEvents = _.sortBy(this.driver.getTrackEvents(), "end");
            // returns undefined if no such element encountered:
            return _.find(sortedEvents, function(event){ return currentTime > event.start; });

        },
        previous: function(e) {
            var previousEvent = this.previousEvent();
            if (previousEvent) {
            	this.stopCurrentEvent();
                this.driver.currentTime(previousEvent.start);
                this.renderPlayer();
            }
        },
        render: function() {
            var that = this;

            if (this.editing) {
                this.$el
                .html(this.templates.edit({body: this.model.get("body")}))
                .find('textarea')
                .bind('keydown', "Ctrl+Shift+down", function timestamp(event) {
                    event.preventDefault()

                    // FIXME: call that.driver instead
                    var driver = AA.router.multiplexView.drivers[that.model.get('about')];
                    $(this).insertAtCaret('\n\n' + AA.utils.secondsToTimecode(driver.currentTime()) + ' -->\n\n');
                })
                .bind('keydown', "Ctrl+Shift+up", function toggle(event) {
                    event.preventDefault()

                    // FIXME: call that.driver instead
                    var driver = AA.router.multiplexView.drivers[that.model.get('about')];
                    if (driver.paused()) {
                        driver.play();
                    } else {
                        driver.pause();
                        //AA.router.navigate('t=' + mediaElt.currentTime + 's', {trigger: false, replace: true})
                    }
                })
                .bind('keydown', "Ctrl+Shift+left", function rewind(event) {
                    event.preventDefault()

                    // FIXME: call that.driver instead
                    var driver = AA.router.multiplexView.drivers[that.model.get('about')];
                    var nextTime = Math.max(driver.currentTime() - 5, 0);
                    driver.currentTime(nextTime);
                    //AA.router.navigate('t=' + mediaElt.currentTime + 's', {trigger: false, replace: true})
                })
                .bind('keydown', "Ctrl+Shift+right", function fastForward(event) {
                    event.preventDefault()

                    // FIXME: call that.driver instead
                    var driver = AA.router.multiplexView.drivers[that.model.get('about')];
                    var nextTime = Math.min(driver.currentTime() + 5, driver.duration());
                    driver.currentTime(nextTime);
                    //AA.router.navigate('t=' + mediaElt.currentTime + 's', {trigger: false, replace: true})
                });
            } else {
                var model = this.model;
                // FIXME: typogrify throw an error on empty strings
                //var body = typogr.typogrify(markdown.toHTML(this.model.get("body"), "Aa"));
                var body = markdown.toHTML(this.model.get("body"), "Aa");

                this.$el
                .html(this.templates.view({
                    body:        body,
                    about:       this.model.get('about'),
                    isSlideshow: this.isSlideshow()
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
                    resize: function (event, ui) {
                        if (event.ctrlKey) {
                            $("html").addClass("grid");

                            ui.element.width((Math.floor(ui.size.width / 20) * 20) - (ui.position.left % 20));
                            ui.element.height((Math.floor(ui.size.height / 20) * 20) - (ui.position.top % 20));
                        } else {
                            $("html").removeClass("grid");
                        }
                    },
                    stop: function(event, ui) {
                        $("html").removeClass("grid");

                        model.set({
                            'width': ui.size.width,
                            'height': ui.size.height,
                        }).save();
                    }
                })
                .draggable({
                    cancel: ".cancelDraggable, textarea",
                    distance: 10,
                    scroll: true,
                    start: function(event, ui) {
                        $(this).css('cursor','move');
                    },
                    drag: function (event, ui) {
                        that.editMenu.redraw ();
                        
                        if (event.ctrlKey) {
                            $("html").addClass("grid");
                            ui.position.left = Math.floor(ui.position.left / 20) * 20;
                            ui.position.top = Math.floor(ui.position.top / 20) * 20;
                        } else {
                            $("html").removeClass("grid");
                        }
                    },
                    stop: function(event, ui) { 
                        $(this).css('cursor','auto');
                        $("html").removeClass("grid");

                        // Makes sure an annotation doesn't get a negative
                        // offset
                        var pos = $(this).position();

                        pos.top = pos.top < 0 ? 0 : pos.top;
                        pos.left = pos.left < 0 ? 0 : pos.left;

                        $(this).css({
                            top: pos.top,
                            left: pos.left
                        });
                        
                        that.editMenu.redraw ();
                        
                        model.set({
                            top: pos.top,
                            left: pos.left,
                        }).save();
                    }
                })
                .renderResources();
                
                if(this.driver) {
                    this.updateAnnotationEvents();
                }
            };

            return this;
        },
        renderPlayerConditionally: function(uri) {
            if (uri === this.model.get("about")) {
                this.renderPlayer();
            };
        },
        renderPlayer: function() {
            var duration = this.driver.duration();
            if (duration === 0) {
                duration = _.max( _.pluck(this.driver.getTrackEvents(), 'end') );
            }
            this.$el.find(".controls")
                .html(this.templates.player({
                    hasPlay:     this.hasPlay(),
                    paused:      this.driver.paused(),
                    duration:    AA.utils.secondsToTimecode(duration),
                    currentTime: AA.utils.secondsToTimecode(this.driver.currentTime()),
                    next:        this.nextEvent(),
                    previous:    this.previousEvent(),
                }));
            return this;
        }
    });

    AA.AnnotationCollectionView = Backbone.View.extend({
        events: {
            "dblclick"            : "showMenu",
            "click"               : "hideMenu",
        },
        
        showMenu: function (e) {
            if (this.cursorMenu.visible()) {
                this.cursorMenu.hide ();
            }
            
            this.cursorMenu.show (e);
        },
        
        hideMenu: function (e) {
            this.cursorMenu.hide ();
        },
        
        collection: new AA.AnnotationCollection(), 
        el: 'article#canvas',
        
        addAnnotation: function(event) {
            var offsetBtn = $(event.currentTarget).position();
            var offsetCanvas = this.$el.position();
            var top = offsetBtn.top - offsetCanvas.top;
            var left = offsetBtn.left - offsetCanvas.left;
            this.collection.create({top: top, left: left});
            this.hideMenu ();
        },
        
        organizeAnnotations: function (event) {
            this.collection.each(function(model, index) {
                model.set({
                    'left': 20 + (index * 20),
                    'top': 20 + (index * 20),
                }, {animate: true}).save();
            });
            
            this.hideMenu ();
        },
        
        initialize: function() {
            this.cursorMenu = new AA.widgets.Menu ({iconSize: 40, iconSpacing: 5, position: 'cursor'});
            
            this.cursorMenu.register ([
                // Create Annotation Button
                new AA.widgets.MenuButton ({title: 'new annotation', class: 'icon5'})
                    .on('click', this.addAnnotation.bind(this)),

                // Create Toggle grid Button (doing nothing at the moment)
                new AA.widgets.MenuButton ({title: 'toggle grid', class: 'icon2'})
                    .on('click', function(event) { return false; }),
                    
                // Create Change grid Button (doing nothing at the moment)
                new AA.widgets.MenuButton ({title: 'change grid', class: 'icon3'})
                    .on('click', function(event) { return false; }),

                // Create Organize annotations Button
                new AA.widgets.MenuButton ({title: 'organize annotations', class: 'icon1'})
                    .on('click', this.organizeAnnotations.bind(this))
            ]);
            
            this.listenTo(this.collection, 'add', this.renderOne);

            this.render();
        },
        renderOne: function(model, collection) {
            var $el = this.$el;
            var annotationView = new AA.AnnotationView({model: model});
            $el.append(annotationView.el);

            // As the registration function queries the document, the
            // annotation needs to be appended first in order for the program
            // to find the drivers
            annotationView.registerChildrenAsDrivers();

            return this;
        },
        
        render: function() {
            var $el = this.$el;
            $el.empty();
            this.collection.each(function(annotation) {
                var annotationView = new AA.AnnotationView({model: annotation});
                $el.append(annotationView.el);
                
                // As the registration function queries the document, the
                // annotation needs to be appended first in order for the program
                // to find the drivers
                annotationView.registerChildrenAsDrivers();
                    
            });

            AA.globalEvents.trigger('aa:newDrivers');
            return this;
        }
    });
})();  // end of the namespace AA

// vim: set foldmethod=indent:
