describe("The views", function() {

    describe("The User view", function(){
        
        var mockUserHash = {
                    id: 'me'
                }
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

    /*
    describe("The Page view", function(){
        it("knows to find a mime-type for a filename", function(){
            expect(AA.utils.path2mime("poster.jpg")).toBe("image/jpeg");
        });
    });

    describe("The Annotation view", function(){
        it("knows to find a mime-type for a filename", function(){
            expect(AA.utils.path2mime("poster.jpg")).toBe("image/jpeg");
        });
    }); */
  
  
});
