describe("The views", function() {
    
    AA.router = {}; // To fake the fact that some views are normally bound to the router

    describe("The User view", function(){
        
        var mockUserHash = {
                    id: 'me'
            };
        var mockUserModel = new Backbone.Model(mockUserHash);
        AA.userView = new AA.UserView({ model : mockUserModel });
        
        it("can be initialised", function(){
            expect(AA.userView).toBeDefined();
        });

        it("won’t render if not provided with info", function(){
            expect($("#user-meta")).not.toExist();
        });
        

        it("will be visible once information (from the server) has been incorporated", function(){
            AA.userView.model.set({
                                    date_joined: "2013-10-03T12:52:37.178270",
                                    first_name: "",
                                    id: 1,
                                    last_login: "2013-12-05T11:31:07.726953",
                                    last_name: "",
                                    resource_uri: "/pages/api/v1/user/1/",
                                    username: "mockUser"
                            });
            expect($("#user-meta")).toExist();
        });

        it("will show us the username, if it does not know the first name", function() {
            expect($("span.user.self")).toHaveText("mockUser");
        });

        it("once it does know it, it will present us the first name instead", function() {
            AA.userView.model.set({
                                    first_name: "Albert",
                                    last_name: "Camus"
                            });
            expect($("span.user.self")).toHaveText("Albert");
        });

    });

    describe("The Page view", function(){
        
        var mockPageHash = {
                    id: 'test_page'
            };
        var mockPageModel = new Backbone.Model(mockPageHash);
        AA.router.pageView = new AA.PageView({ model : mockPageModel });
        
        it("can be initialised", function(){
            expect(AA.router.pageView).toBeDefined();
        });

        it("won’t render if not provided with info", function(){
            expect($("#page-meta")).not.toExist();
        });
        

        it("will be visible once more info is retrieved", function(){
            AA.router.pageView.model.set({
                                    "annotations": [
                                        "/pages/api/v1/annotation/2/",
                                        "/pages/api/v1/annotation/9/",
                                        "/pages/api/v1/annotation/24/"
                                    ],
                                    "id": 1,
                                    "name": "Test Page!",
                                    "permissions": {
                                        "administer_page": [
                                            {
                                                "current": true,
                                                "id": 1,
                                                "name": "osp",
                                                "type": "user",
                                                "uri": "/pages/api/v1/user/1/"
                                            }
                                        ],
                                        "change_page": [
                                            {
                                                "current": true,
                                                "id": 1,
                                                "name": "osp",
                                                "type": "user",
                                                "uri": "/pages/api/v1/user/1/"
                                            }
                                        ],
                                        "view_page": [
                                            {
                                                "current": true,
                                                "id": 1,
                                                "name": "osp",
                                                "type": "user",
                                                "uri": "/pages/api/v1/user/1/"
                                            },
                                            {
                                                "current": false,
                                                "id": -1,
                                                "name": "AnonymousUser",
                                                "type": "user",
                                                "uri": "/pages/api/v1/user/-1/"
                                            }
                                        ]
                                    },
                                    "resource_uri": "/pages/api/v1/page/test-page/",
                                    "slug": "test-page"
                                });
            expect($("#page-meta")).toExist();
        });
        
    });
    
    
    describe("The Annotation view", function(){
        
        Popcorn.player( "baseplayer" );
        
        AA.router.multiplexView = new AA.MultiplexView();
        
        var mockAnnotationsHash = {
                                    "meta": {
                                        "limit": 20,
                                        "next": null,
                                        "offset": 0,
                                        "previous": null,
                                        "total_count": 3
                                    },
                                    "objects": [
                                        {
                                            "about": document.location.origin + "/static/components/popcorn-js/test/trailer.ogv",
                                            "body": "# Foo!\n## Bar!\n\nThis is how I imagine Camus when I read his diary, and this seems like a good model for living: you go to a swimming pool in Algiers, swim, dry in the sun, look at the beautiful boys and girls, think really hard, look at the beautiful boys and girls, think really hard, write a sentence, rewrite the sentence, swim, dry in the sun, rewrite the sentence, think really hard, rewrite the sentence, look at the beautiful boys and girls, rewrite the sentence.\n\n00:04,738 --> 00:16,867\n\nI hope that you'll go along with this rather unusual setting, and the fact that I remain seated when I get introduced, and the fact that I'm going to come to you mostly through this medium here for the rest of the show.  I should tell you that I'm backed up by quite a staff of people between here and Menlo Park [sp?], where Stanford research is located some thirty miles south of here.  If everyone does their job well, it's all go very interesting, I think.  [Laughs]\n\n00:42,867 --> 00:58,867\n\nThe research program that I'm going to describe to you is quickly characterizable by saying:  If in your office, you as an intellectual worker, were supplied with a computer display backed up by a computer that was alive for you all day, and was instantly responsible, responsive [laughs], instantly responsive to every action you had, how much value could you derive from that?  Well, this basically characterizes what we've been pursuing for many years, and what we we call The Augmentive Human Intellect Research Center at Standford Research Institute.\n",
                                            "height": 400,
                                            "id": 2,
                                            "left": 290,
                                            "page": "/pages/api/v1/page/test-page/",
                                            "resource_uri": "/pages/api/v1/annotation/2/",
                                            "top": 77,
                                            "width": 301
                                        },
                                        {
                                            "body": "Nouvelle annotation\n\n\n[[ embed::" + document.location.origin + "/static/components/popcorn-js/test/trailer.ogv ]]\n\n",
                                            "height": 400,
                                            "id": 9,
                                            "left": 714,
                                            "page": "/pages/api/v1/page/test-page/",
                                            "resource_uri": "/pages/api/v1/annotation/9/",
                                            "top": 96,
                                            "width": 300
                                        },
                                        {
                                            "body": "MOCKsuper\n\n## API\n-  Modeling ☑\n-  Versieeoning\n\n## Annotations\n-  manipulation / edition ☑\n-  markdown syntax to javascript ☑\n-  the metadate 'is part of' -> some pages are part of several 'collections'.\n\n## Tags, Indexation\n-  adapting the indexing code to the new architecture\n-  stabilizing filters and tags\n-  contextual tagging within a publication\n\n## User permissions\n-  authentication system ☑\n-  viewing/editing permissions ☑\n-  reverting/indexing permissions\n\n## Interface and layout tools\n-  hotglue like interface ☑\n-  Miniature navigation map\n-  grid and snapping helpers\n-  CSS/templates setup ☑\n-  CSS/templates modifiable\n-  annotation distribution actions: spring layout, cascade layout...\n\n## Media support\n-  flash fallback for unsupported formats\n-  youtube and vimeo support + synchronizing with annotations\n-  setting in and out points for media (enabling basic sound and video editing)\n-  once an annotation becomes active, play the video/sound contained inside\n-  make it possible to link to (a specific time in) another video/sound\n-  make slideshow in non-convoluted way\n-  Adjust appearance of sound player\n\n## Miscellaneous\n-  migrating the old website\n-  deployement\n-  wrap up\n-  better encoding and serving of media files\n-  documentation\n",
                                            "height": 400,
                                            "id": 24,
                                            "left": 415,
                                            "page": "/pages/api/v1/page/test-page/",
                                            "resource_uri": "/pages/api/v1/annotation/24/",
                                            "top": 312,
                                            "width": 300
                                        }
                                    ]
                            };
        
        spyOn($, 'ajax').andCallFake(function(options) {
            options.success(mockAnnotationsHash);
        });
        
        AA.router.annotationCollectionView = new AA.AnnotationCollectionView({id : 'test_page'});
        
        it("can be initialised", function(){
            expect(AA.router.annotationCollectionView).toBeDefined();
        });
        
        it("loads the right number of annotations", function(){
            expect(AA.router.annotationCollectionView.collection.length).toBe(3);
        });
        
        it("has turned a semantic link to a video into an actual <video> tag", function(){
            expect($("video")).toExist();
        });
        
        it("has about attributes for all annotations", function() {
            expect($("article > section").map(function(i, el) {
                return $(el).attr('about');
                }).get().length
            ).toBe(3);
        });
        
        it("the about attributes are absolute hyperlinks", function() {
            expect($("article > section").map(function(i, el) {
                return $(el).attr('about').match(/http:\/\/[^/]+\//) !== null;
                }).get()
            ).toEqual([true, true, true]);
        });
        
        it("the about attributes are correct", function() {
            expect($("article > section:nth-child(1)")).toHaveAttr("about", document.location.protocol + '//' + document.location.host + "/static/components/popcorn-js/test/trailer.ogv");
            expect($("article > section:nth-child(2)")).toHaveAttr("about", document.location.origin + document.location.pathname);
            expect($("article > section:nth-child(3)")).toHaveAttr("about", document.location.origin + document.location.pathname);
        });
    });


    describe("The Multiplex view", function() {
        
        AA.listeningAnnotations();
        
        it("can be initialised", function(){
            expect(AA.router.multiplexView).toBeDefined();
        });
        
        it("finds popcorn", function() {
            expect(Popcorn).toBeDefined();
        });
        
        it("finds the right amount of drivers", function(){
            // 1 driver for the video,
            // 1 for the page (2 elements that make reference to it),

            // about’s should also be able to be about annotation boxes
            // test that later
            expect(_.keys(AA.router.multiplexView.drivers).length).toBe(2);
        });
        
        it("the video has 2 registered events", function(){
            expect(AA.router.multiplexView.drivers[ document.location.origin + "/static/components/popcorn-js/test/trailer.ogv" ].getTrackEvents().length).toBe(2);
        });
    });
});
