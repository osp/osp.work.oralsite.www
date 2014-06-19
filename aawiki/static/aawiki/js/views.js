window.AA = window.AA || {};

(function(undefined) {
    'use strict';

    Backbone.View.prototype.empty = function() {
        this.el.innerHTML = "";
        this.stopListening();
        return this;
    };


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


    AA.EditPermissionsView = Backbone.View.extend({
        tagName: 'div',
        attributes: {class: 'popup-wrapper'},
        events: {
            'click input[value="cancel"]': 'remove', 
            "submit"                     : 'submit',
            "keypress input"             : "submitOnEnter",
        },
        template: _.template($('#edit-permissions-view-template').html()),
        submit: function (event){
            event.preventDefault();

            /* do something here */

            this.remove();
        },
        submitOnEnter: function(event) {
            // cf http://japhr.blogspot.be/2011/11/submitting-backbonejs-forms-with-enter.html
            if ( event.keyCode === 13 ) { // 13 is the code for ENTER KEY
                this.login(event);
            }
        },
        initialize: function() {
            this.render();
        },
        render: function() {
            var permissions = this.model.get('permissions');

            var ids = _.pluck(permissions.view_page, 'id');
            var visitorCollection = new Backbone.Collection(AA.router.userCollection.models);
            visitorCollection.each(function(user) {
                if (_.indexOf(ids, user.get("id"))) { 
                    user.set('selected', true); 
                }   
            });

            ids = _.pluck(permissions.change_page, 'id');
            var editorCollection = new Backbone.Collection(AA.router.userCollection.models);
            editorCollection.each(function(user) {
                if (_.indexOf(ids, user.get("id"))) { 
                    user.set('selected', true); 
                }   
            });

            ids = _.pluck(permissions.administer_page, 'id');
            var adminCollection = new Backbone.Collection(AA.router.userCollection.models);
            adminCollection.each(function(user) {
                if (_.indexOf(ids, user.get("id"))) { 
                    user.set('selected', true); 
                }   
            });

            this.$el.html(this.template({
                visitors: visitorCollection,
                editors: editorCollection,
                admins: adminCollection
            }));

            $('body').append(this.$el);
        },
    });


    AA.EditIntroductionView = Backbone.View.extend({
        tagName: 'div',
        attributes: {class: 'popup-wrapper'},
        events: {
            'click input[value="cancel"]': 'remove', 
            "submit"                     : 'submit',
            "keypress input"             : "submitOnEnter",
        },
        template: _.template($('#edit-introduction-view-template').html()),
        submit: function (event){
            event.preventDefault();

            this.model
                .loadFront($('textarea[name="introduction"]', this.$el).val(), 'introduction')
                .save();

            this.remove();
        },
        submitOnEnter: function(event) {
            // cf http://japhr.blogspot.be/2011/11/submitting-backbonejs-forms-with-enter.html
            if ( event.keyCode === 13 ) { // 13 is the code for ENTER KEY
                this.login(event);
            }
        },
        initialize: function() {
            this.render();
        },
        render: function() {
            this.$el.html(this.template({introduction: this.model.toFrontMatter()}));
            $('body').append(this.$el);
        },
    });

    
    AA.PopUpView = Backbone.View.extend({
        tagName: 'div',
        attributes: {class: 'popup-wrapper'},
        events: {
            'click input[value="cancel"]': 'remove', 
            "submit"                     : 'login',
            "keypress input"             : "loginOnEnter",
        },
        template: _.template($('#popup-view-template').html()),
        login: function (event){
            var that = this;
            event.preventDefault();

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
                    that.remove();
                },
            });
        },
        loginOnEnter: function(event) {
            // cf http://japhr.blogspot.be/2011/11/submitting-backbonejs-forms-with-enter.html
            if ( event.keyCode === 13 ) { // 13 is the code for ENTER KEY
                this.login(event);
            }
        },
        initialize: function() {
            this.render();
        },
        render: function() {
            this.$el.html( this.template( {} ) );
            $('body').append(this.$el);
        },
    });

    
    AA.UserView = Backbone.View.extend({
        id: 'user-meta', // <div id="user-meta"></div>
        templates: {
            view: _.template($('#user-view-template').html()),
        },
        events: {
            "click #login-link"         : "login",
            "click #logout-link"        : "logout",
        },
        render: function() {
            // Adds an anonymous class if not connected so we can "unpublish"
            // wip annotations using css
            var id = this.model.get('id');
            if (typeof id === "undefined" | id === -1) {
                $('#canvas').addClass('anonymous');
            } else {
                $('#canvas').removeClass('anonymous');
            }

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
            new AA.PopUpView();
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
            "click #toggleDrawer"               : "toggleDrawer",
            "click #commit"                     : "commit",
            "click #commit-list a"              : "wayback",
            "change #permissions-visible"       : "updatePermissionsVisible",
            //"change #permissions-editable"      : "updatePermissionsEditable",
            //"change #permissions-administrated" : "updatePermissionsAdministrated",
        },
        toggleDrawer: function(event) {
            $('#sidebar, #canvas').toggleClass('hide');
        },
        wayback: function(event) {
            event.preventDefault();
            var href = $(event.currentTarget).attr('href');
            AA.router.navigate(href.substring(6), {trigger: true});
        },
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
        setTitle: function() {
            document.title = AA.siteView.model.get('name') + ' | ' + this.model.get('name');
        },
        publicUser: {
            "current": false,
            "id": -1,
            "name": "AnonymousUser",
            "type": "user",
            "uri": "/pages/api/v1/user/-1/"
        },
        isPublic: function() {
            // Is AnonymousUser (with id -1) part of the users with view permissions?
            // Then the page can be considered public
            var permissions = this.model.get("permissions");
            if ( _.some(permissions.view_page, function(p) { return p.id === -1; }) ) {
                return true;
            }
            return false;
        },
        updatePermissionsVisible: function() {
            var permissions = this.model.get("permissions");
            
            if ($("#permissions-visible").find("input[type=radio]:checked").val() === "public") {
                // add public user
                permissions.view_page.push(this.publicUser);
            } else {
                // remove public user
                permissions.view_page = _.reject(permissions.view_page, function(p) { return p.id === -1; });
            }
            
            this.model.set("permissions", permissions);
            this.model.save();
        },
        render: function() {
            var context = this.model.toJSON();
            context.introduction = markdown.toHTML(context.introduction, "Aa");
            context.isPublic = this.isPublic();
            
            this.$el.html( this.templates.view( context ) )
                .find('#permalink').draggable({ helper: "clone" })
                .end()
                .find('#accordion').tabs() 
                ;

            AA.router.annotationCollectionView.$el.attr('style', this.model.get('style'));
            AA.router.annotationCollectionView.$el.attr('class', this.model.get('klass'));

            $('#extra-stylesheet').remove();
            var stylesheet = this.model.get('stylesheet');
            if (stylesheet) {
                $('<link>').attr({
                    id: 'extra-stylesheet',
                    rel: 'stylesheet',
                    href: stylesheet
                }).appendTo('head');
            }

            // If the element is not yet part of the DOM:
            if ($('#page-meta').length === 0 ) {
                $('#page-meta-container').prepend(this.el);
            }
            
            this.setTitle();
            return this;
        },
        initialize: function() {
            this.listenTo(this.model, 'change', this.render);
            // if we want to already render the template, without the values fetched: this.render();
        },
    });


    AA.RevisionView = Backbone.View.extend({
        el: '#revisions_browser_ctrl',
        template: _.template($('#revisions-browser-template').html()),
        events: {
            'click #toggleRevisions': 'toggleRevisions',
        },
        toggleRevisions: function(event) {
            event.preventDefault();

            $('#revisions_browser_ctrl').toggleClass('hidden');
        },
        render: function() {
            this.$el
            .empty()
            .html(this.template({
                prev: this.model.prev_rev(),
                next: this.model.next_rev(),
                rev: this.model.current_rev(),
                revisions: this.model.get('revisions'),
                slug: AA.router.currentSlug
            }))
            .find('a').on('click', function(event) {
                event.preventDefault();
                var href = $(event.currentTarget).attr('href');
                AA.router.navigate(href.substring(6), {trigger: true});
            });
        },
        initialize: function() {
            this.listenTo(this.model, 'change', this.render);
        },
    });


    AA.MultiplexView = Backbone.View.extend({
        initialize: function() {
            this.drivers = {};
        },
        registerDriver : function(uri) {
            var that = this;
            if (typeof(this.drivers[uri]) === 'undefined') {
                
                if (uri === document.location.origin + document.location.pathname) {
                    // If the about is the current page, attach to the general timeline
                    this.drivers[uri] = Popcorn.baseplayer( "#timeline" );
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
                    this.drivers[uri].on("timeupdate", function() {
                         AA.globalEvents.trigger('aa:timeUpdate', uri);
                    });

                    /* Adding the appropriate classes to the miniplayers based on pause and play events */
                    // I’m not sure this is the right way to go about this:
                    var miniPlayerPlayUI = function() {
                        $('.mini-player[rel="' + uri + '"]').removeClass("paused").addClass("playing");
                        that.playChildren(uri);
                    };
                    var miniPlayerPauseUI = function() {
                        $('.mini-player[rel="' + uri + '"]').removeClass("playing").addClass("paused");
                        that.pauseChildren(uri);
                    };
                    this.drivers[uri].on("play", miniPlayerPlayUI).on("playing", miniPlayerPlayUI);
                    this.drivers[uri].on("pause", miniPlayerPauseUI).on("ended", miniPlayerPauseUI).on("abort", miniPlayerPauseUI);
                }
                return this.drivers[uri];
            } else {
                // already registered, just return it
                return this.drivers[uri];
            }
        },
        findChildren: function(uri) {
            return $('section[about="' + uri+ '"]');
        },
        findChildrenMedia: function(uri) {
            var that = this;
            var $childrenSections = this.findChildren(uri);
            
            var uris = [];

            var $activeAnnotations = $childrenSections.find('section[typeof="aa:annotation"].active');
            
            $activeAnnotations.each(function(i, el) {
                $(el).find(".embed.hosted").each(function(i, el) {
                    uris.push( $(el).attr("data-uri") );
                });
                $(el).find("video[src],audio[src]").each(function(i, el) {
                    uris.push( $(el).attr("src") );
                });
            });
            
            return uris;
        },
        pauseChildren: function(uri) {
            var activeChildDriverUris = this.findChildrenMedia(uri);
            
            for (var i=0; i<activeChildDriverUris.length; i++) {
                var driver = AA.router.multiplexView.drivers[activeChildDriverUris[i]];
                if (typeof driver !== "undefined" && !driver.paused()) {
                    driver.pause();
                }
            }
        },
        playChildren: function(uri) {
            var activeChildDriverUris = this.findChildrenMedia(uri);
            
            for (var i=0; i<activeChildDriverUris.length; i++) {
                var driver = AA.router.multiplexView.drivers[activeChildDriverUris[i]];
                if (typeof driver !== "undefined" && driver.paused()) {
                    driver.play();
                }
            }
        }
    });


    AA.AbstractPlayer = {
        playPause: function(e) {
            /**
             * Sends a ‘play’ event to the driver,
             * or a pause event if it is already playing.
             *
             * (The Popcorn instance wraps the HTML5 audio/video player,
             *  so it shares the same base methods)
             *  */
            if (this.driver.paused()) {
                this.driver.play();
            } else {
                this.driver.pause();
            }
            this.render();
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
                this.render();
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
                this.render();
            }
        },
        duration: function() {
            var duration = this.driver.duration();
            if (duration === 0) {
                return _.max( _.pluck(this.driver.getTrackEvents(), 'end') );
            }
            return duration;
        }
    };


    AA.AbstractPlayerEvents = {
        "click .play":     "playPause",
        "click .next":     "next",
        "click .previous": "previous",
    };


    AA.TimelinePlayerView = Backbone.View.extend({
        el: '#timeline',
        events: AA.AbstractPlayerEvents,
        templates: {
            view: _.template($('#timeline-player-template').html()),
        },
        initialize: function() {
            this.listenTo(AA.globalEvents, "aa:timeUpdate", this.renderConditionally, this);
            this.listenTo(AA.globalEvents, "aa:newDrivers", this.render, this);
            this.driver = AA.router.multiplexView.registerDriver(document.location.origin + document.location.pathname);
            this.render();
        },
        hasPlay: function() {
            return this.driver.getTrackEvents().length > 0;
        },
        renderConditionally: function(uri) {
            if (uri === document.location.origin + document.location.pathname) {
                this.render();
            };
        },
        render: function() {
            // Once this view has first rendered, subsequent updates target specific dom elements.
            //
            // This is because the constant rerendering through timeupdate events made the
            // controls unclickable.
            var that = this;
            if (this.hasPlay()) {
                // do we already have the controls?
                if (this.$el.find('.controls').length === 0) {
                    this.$el.html(this.templates.view({}));
                }

                // if the driver is paused and there is still a pause button showing,
                // we should make sure it becomes a play button (and vice versa):
                var playButtonShowsPause = function() {
                    return that.$el.find('.controls .fa-pause').length !== 0;
                };
                if (this.driver.paused() === playButtonShowsPause()) {
                    this.$el.find('.play').toggleClass("fa-play fa-pause");
                }
                
                // update time based values:
                this.$el.find('.current_time').text(AA.utils.secondsToTimecode(this.driver.currentTime()));
                this.$el.find('.duration').text(AA.utils.secondsToTimecode(this.duration()));
                this.$el.find('.next').toggleClass("disabled", !this.nextEvent());
                this.$el.find('.previous').toggleClass("disabled", !this.previousEvent());
            }
        },
    }).extend(AA.AbstractPlayer);


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
            "click"                     : "focus",
            "click .controls .play"     : "playPause",
            "click .next"               : "next",
            "click .previous"           : "previous",            
            "click .mini-player"         : "playPauseMiniPlayer"
        },
        initialize: function() {
            // references to timed annotations
            this.driverEventIDs = [];

            // local events
            this.listenTo(this.model, 'destroy', this.remove);
            this.listenTo(this.model, 'change:top change:left', this.onPositionChange);

            // global events
            this.listenTo(AA.globalEvents, "aa:newDrivers", this.registerDriver, this);
            this.listenTo(AA.globalEvents, "aa:newDrivers", this.registerChildrenAsDrivers, this);
            this.listenTo(AA.globalEvents, "aa:timeUpdate", this.renderPlayerConditionally, this);

            this.render();
        },
        focus: function(e) {
            if (AA.router.annotationCollectionView.cursorMenu.visible()) {
                AA.router.annotationCollectionView.cursorMenu.hide ();
            };
        
            $('.section1').removeClass('focused');

            var position = this.$el.position();

            if (position.left < 45) {
                this.$el.find('.menu-left').css({
                    left: 'auto',
                    right: -50
                });
            } else {
                this.$el.find('.menu-left').css({
                    right: 'auto',
                    left: -45
                });
            };

            if (position.top < 45) {
                this.$el.find('.menu-top').css({
                    top: 'auto',
                    bottom: -50
                });
            } else {
                this.$el.find('.menu-top').css({
                    bottom: 'auto',
                    top: -45
                });
            };

            this.$el.addClass('focused');
            
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
                });
            };
        },
        toggle: function() {
            if (this.editing) {
                this.model
                    .loadFront($('textarea', this.$el).val(), 'body')
                    .save();
            };

            this.editing = !this.editing;
            this.render();
        },
        deleteAnnotation: function(event) {
            if (window.confirm('This will permanently delete this annotation. Proceed?')) {
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
        changeZIndex: function() {
            var that = this;
            var min = this.model.collection.min(function(model) {
                return model.zIndex();
            }).zIndex();
            var max = this.model.collection.max(function(model) {
                return model.zIndex();
            }).zIndex();

            AA.widgets.slider(event, function(x, y) {
                $('.wrapper', that.$el).css('z-index', (x < 0) ? min - 1 : max + 1);
            }, function(x, y) {
                var style_attr = $('<div>')
                    .attr('style', that.$el.attr('style'))
                    .css('z-index', (x < 0) ? min - 1 : max + 1)
                    .attr('style');

                that.model.set("style", style_attr);
                that.model.save();
                that.render();
            });

            return false;
        },
        toggleCollapsing: function() {
            var $tmp = $('<div>').attr('class', this.$el.attr('class'));

            if ($tmp.hasClass('collapsed') && $tmp.hasClass('hidden')) {
                $tmp.removeClass('collapsed hidden');
            } else if ($tmp.hasClass('collapsed')) {
                $tmp.removeClass('collapsed');
                $tmp.addClass('hidden');
            } else if ($tmp.hasClass('hidden')) {
                $tmp.removeClass('hidden');
            } else {
                $tmp.addClass('collapsed');
            }

            this.model.set("klass", $tmp.attr('class'));
            this.model.save();
            this.render();

            return false;
        },
        toggleTransition: function() {
            var $tmp = $('<div>').attr('class', this.$el.attr('class'));

            $tmp.toggleClass('active-only');

            this.model.set("klass", $tmp.attr('class'));
            this.model.save();
            this.render();

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
            this.renderPlayer();
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
        isMedia: function() {
            // We need to find one and only one audio or video,
            // inside one and only one annotation,
            // then we know this is a media box

            var annotations = this.$el.find("[typeof='aa:annotation']");
            if (annotations.length !== 1) { return false; }
            
            var media = annotations.find("audio[src], video[src]");
            if (media.length !== 1) {
                return false;
            }
            return true;
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
                this.renderPlayer();
            } else {
                this.driver.pause();
                this.renderPlayer();
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
        nextEvent: function() {
            var currentTime = this.driver.currentTime();
            var sortedEvents = _.sortBy(this.driver.getTrackEvents(), "start");
            // returns undefined if no such element encountered:
            return _.find(sortedEvents, function(event){ return currentTime < event.start; });
        },
        next: function(e) {
            var nextEvent = this.nextEvent();
            if (nextEvent) {
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
                this.driver.currentTime(previousEvent.start);
                this.renderPlayer();
            }
        },
        render: function() {
            var that = this;
            this.$el.attr('title', this.model.get('title'));

            if (this.editing) {
                this.$el
                .addClass('editing')
                .html(this.templates.edit({body: this.model.toFrontMatter()}))
                .find('textarea')
                .bind('keydown', "Ctrl+Shift+down", function timestamp(event) {
                    event.preventDefault();

                    // FIXME: call that.driver instead
                    var driver = AA.router.multiplexView.drivers[that.model.get('about')];
                    $(this).insertAtCaret('\n\n' + AA.utils.secondsToTimecode(driver.currentTime()) + ' -->\n\n');
                })
                .bind('keydown', "Ctrl+Shift+up", function toggle(event) {
                    event.preventDefault();

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
                    event.preventDefault();

                    // FIXME: call that.driver instead
                    var driver = AA.router.multiplexView.drivers[that.model.get('about')];
                    var nextTime = Math.max(driver.currentTime() - 5, 0);
                    driver.currentTime(nextTime);
                    //AA.router.navigate('t=' + mediaElt.currentTime + 's', {trigger: false, replace: true})
                })
                .bind('keydown', "Ctrl+Shift+right", function fastForward(event) {
                    event.preventDefault();

                    // FIXME: call that.driver instead
                    var driver = AA.router.multiplexView.drivers[that.model.get('about')];
                    var nextTime = Math.min(driver.currentTime() + 5, driver.duration());
                    driver.currentTime(nextTime);
                    //AA.router.navigate('t=' + mediaElt.currentTime + 's', {trigger: false, replace: true})
                });

                this.$el.find('.menu-top').append([
                    // Edit Annotation Button
                    new AA.widgets.MenuButton({title: 'save changes', class: 'icon-ok'})
                        .on('click', this.toggle.bind(this)),
                ]);
            } else {
                var model = this.model;
                // FIXME: typogrify throw an error on empty strings
                //var body = typogr.typogrify(markdown.toHTML(this.model.get("body"), "Aa"));

                var body = markdown.toHTML(this.model.get("body"), "Aa");
                var title = this.model.get("title");

                this.$el.attr('style', this.model.get('style'));
                this.$el.attr('class', this.model.get('klass'));

                this.$el
                .removeClass('editing')
                .html(this.templates.view({
                    body:        body,
                    title:       title,
                    about:       this.model.get('about'),
                    isSlideshow: this.isSlideshow(),
                    // isMedia:     this.isMedia() added this down below because the resources need to be rendered first
                }))
                .addClass('section1')
                .attr('id', 'annotation-' + AA.utils.zeropad( this.model.attributes.id, 4 )) // id="annotation-0004"
                .attr('about', this.model.attributes.about)
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
                            style: $(this).attr('style')
                        }).save();
                    }
                })
                .draggable({
                    handle: '.icon-drag',
                    containment: "parent",
                    distance: 10,
                    scroll: true,
                    scrollSensitivity: 100,
                    drag: function (event, ui) {
                        
                        if (event.ctrlKey) {
                            $("#canvas").addClass("grid");
                            ui.position.left = Math.floor(ui.position.left / 20) * 20;
                            ui.position.top = Math.floor(ui.position.top / 20) * 20;
                        } else {
                            $("#canvas").removeClass("grid");
                        }
                    },
                    stop: function(event, ui) { 
                        if (ui.position.left < 45) {
                            that.$el.find('.menu-left').css({
                                left: 'auto',
                                right: -50
                            });
                        } else {
                            that.$el.find('.menu-left').css({
                                right: 'auto',
                                left: -45
                            });
                        };

                        if (ui.position.top < 45) {
                            that.$el.find('.menu-top').css({
                                top: 'auto',
                                bottom: -50
                            });
                        } else {
                            that.$el.find('.menu-top').css({
                                bottom: 'auto',
                                top: -45
                            });
                        };
                        $("#canvas").removeClass("grid");

                        model.set({
                            style: $(this).attr('style')
                        }).save();
                    }
                })
                .droppable({ 
                    accept: ".icon-target",
                    greedy: true,
                    hoverClass: "drop-hover",
                    over: function( event, ui ) {
                        event.stopImmediatePropagation();
                    },
                    drop: function( event, ui ) {
                        var about = ui.draggable.attr('href');
                        var answer = window.confirm("You are about to connect the annotation to " + about + ". Proceed?");

                        if (answer) {
                            that.model.set({'about': about}).save();
                            that.render();
                        };
                    }
                })
                .renderResources();

                this.$el.find('.menu-top').append([
                    // Drag icon
                    new AA.widgets.MenuButton({title: 'drag annotation', class: 'icon-drag'}),
                    // Edit Annotation Button
                    new AA.widgets.MenuButton({title: 'edit annotation', class: 'icon-edit'})
                        .on('click', this.toggle.bind(this)),
                    // Delete Annotation Button
                    new AA.widgets.MenuButton({title: 'delete annotation', class: 'icon-delete'})
                        .on('click', this.deleteAnnotation.bind(this)),
                    // Export to Audacity Button
                    new AA.widgets.MenuButton({title: 'export annotation to audacity markers', class: 'icon-export'})
                        .on('click', this.exportAnnotationToAudacityMarkers.bind(this)),
                    // Import from Audacity Button
                    new AA.widgets.MenuButton({title: 'import annotation from audacity markers', class: 'icon-export'})
                        .on('click', this.importAnnotationFromAudacityMarkers.bind(this)),
                    //// Set About Value Button
                    new AA.widgets.MenuButton({title: 'Drag to connect', class: 'icon-target'})
                        .draggable({ helper: "clone" })
                        .attr('href', document.location.origin + document.location.pathname + '#' + 'annotation-' + AA.utils.zeropad( this.model.attributes.id, 4))
                ]);
                this.$el.find('.menu-left').append([
                    //new AA.widgets.MenuButton({title: 'set as slideshow', class: 'icon8'})
                        //.on('click', this.setAsSlideshow.bind(this)),
                    //new AA.widgets.MenuButton({title: 'toggle visibility', class: 'icon2'})
                        //.on('click', this.toggleVisibility.bind(this)),
                    new AA.widgets.MenuButton({title: 'toggle transition', class: 'icon-styles'})
                        .on('click', this.toggleTransition.bind(this)),
                    new AA.widgets.MenuButton({title: 'toggle collapsing', class: 'icon-styles'})
                        .on('click', this.toggleCollapsing.bind(this)),
                    new AA.widgets.MenuButton({title: 'set z-index', class: 'icon-layers'})
                        .on('mousedown', this.changeZIndex.bind(this)),
                ]);

                if (this.isMedia()) {
                    this.$el.addClass("media");
                }
                
                if(this.driver) {
                    this.updateAnnotationEvents();
                }
            };

            /*
             * Transfers the z-index to the wrapper element. It is necessary
             * that section.section1 elements have a z-index set to auto to
             * allow for the .menu elements to be painted on top (it is not
             * very handy otherwise to click button of an overlaping box with a
             * lower z-index).
             *
             * See <http://jsfiddle.net/Fzn5T/3/> for a proff-of-concept.
             */
            var z = this.$el.css('z-index');
            this.$el.css('z-index', 'auto');
            $('.wrapper', this.$el).css('z-index', z);

            return this;
        },
        renderPlayerConditionally: function(uri) {
            if (uri === this.model.get("about")) {
                this.renderPlayer();
            };
        },
        renderPlayer: function() {
            if (this.driver) {
                var duration = this.driver.duration();
            } else {
                return this;
            }
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
            "click"            : "showMenu",
        },
        
        showMenu: function (e) {
            if (this.cursorMenu.visible()) {
                this.cursorMenu.hide ();
            } else {
                var focused = $('.section1.focused').length;

                if (focused) {
                    $('.section1').removeClass('focused');
                } else {
                    this.cursorMenu.show (e);
                };
            }
        },
        
        collection: new AA.AnnotationCollection(), 
        el: 'article#canvas',

        commit: function(event) {
            AA.router.pageView.commit.bind(AA.router.pageView);
        },
        
        addAnnotation: function(event) {
            var offsetBtn = $(event.currentTarget).position();
            var offsetCanvas = this.$el.position();
            var top = offsetBtn.top - offsetCanvas.top;
            var left = offsetBtn.left - offsetCanvas.left;
            this.collection.create({top: top, left: left});
            this.cursorMenu.hide();
        },
        
        organizeAnnotations: function (event) {
            var proceed = window.confirm("This will rearrange your layout… Proceed?");

            if (proceed) {
                // sort the annotations by z-index;
                var sorted = this.collection.sortBy(function(model) { 
                    return model.zIndex();
                });

                _.each(sorted, function(model, index) {
                    model.set({
                        'left': 20 + (index * 20),
                        'top': 20 + (index * 20),
                    }, {animate: true}).save();
                });
            }

            this.cursorMenu.hide();
        },
        
        initialize: function() {
            this.cursorMenu = new AA.widgets.Menu ({iconSize: 40, iconSpacing: 5, position: 'cursor'});
            
            this.cursorMenu.register ([
                // Create Annotation Button
                new AA.widgets.MenuButton ({title: 'new annotation', class: 'icon-new'})
                    .on('click', this.addAnnotation.bind(this)),

                // Create Organize annotations Button
                new AA.widgets.MenuButton ({title: 'organize annotations', class: 'icon-pack'})
                    .on('click', this.organizeAnnotations.bind(this)),

                // Create Snapshot Button
                new AA.widgets.MenuButton ({title: 'take a snapshot', class: 'icon-star'})
                    .on('click', this.commit.bind(this)),

                // Create Browse history Button
                new AA.widgets.MenuButton ({title: 'browse history', class: 'icon-galaxy'})
                    .on('click', function() { window.alert('Not implemented yet!'); }),

                // Create Edit introduction Button
                new AA.widgets.MenuButton ({title: 'edit introduction', class: 'icon-edit'})
                    .on('click', function() { 
                        if (AA.router.annotationCollectionView.cursorMenu.visible()) {
                            AA.router.annotationCollectionView.cursorMenu.hide ();
                        };

                        new AA.EditIntroductionView({model: AA.router.pageModel });
                    }),

                // Create Manage permissions Button
                new AA.widgets.MenuButton ({title: 'manage permissions', class: 'icon-ok'})
                    .on('click', function() { 
                        if (AA.router.annotationCollectionView.cursorMenu.visible()) {
                            AA.router.annotationCollectionView.cursorMenu.hide ();
                        };

                        new AA.EditPermissionsView({model: AA.router.pageModel});
                    }),

                // Create Set About Value Button
                new AA.widgets.MenuButton({title: 'Drag to connect', class: 'icon-target'})
                    .draggable({ helper: "clone" })
                    .attr('href', document.location.origin + document.location.pathname)
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

            AA.globalEvents.trigger('aa:newDrivers');

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
            });
            
            AA.globalEvents.trigger('aa:newDrivers');
            return this;
        }
    });
})();  // end of the namespace AA

// vim: set foldmethod=indent:
