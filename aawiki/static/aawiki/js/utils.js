window.AA = window.AA || {};

(function(undefined) {
    'use strict';

    AA.utils = AA.utils || {};
     
    AA.utils.dewikify = function(name) {
        /*
        Turns URL name/slug into a proper name (reverse of wikify).
        Requires: name may be unicode, str
        Returns: str
    
        NB dewikify(wikify(name)) may produce a different name (first letter gets capitalized)
        
        Btw, Backbone’s router will take care of converting % escaped non-ascii characters
        into UTF-8
        
        AA.Router = Backbone.Router.extend({
            routes: {
                ":slug/": "page",
            },
            page: function(slug) {
                console.log(slug, document.location.pathname);
            }
        });
        
        AA.router = new AA.Router();
        
        In the browser, visiting
        
        http://localhost:8000/pages/Grève/        or:
        http://localhost:8000/pages/Gr%C3%A8ve/
        
        Prints
        
        Grève /pages/Gr%C3%A8ve/ 
        
        */
       
       return name.replace(/_/g, ' ')
    }
})();  // end of the namespace AAS

/*
var data = JSON.stringify({
    "top"   : 158,
    "left"  : 867,
    "body"  : "Nouvelle annotation",
    "width" : 310,
    "height": 347,
    "page"  : "/pages/api/v1/page/test-page/"
});

$.ajax({
    url: 'http://localhost:8000/pages/api/v1/annotation/',
    type: 'POST',
    contentType: 'application/json',
    data: data,
    dataType: 'json',
    processData: false,
    succes: function(data) { console.log(data); },
    error: function(error) { console.log(error); }
});*/
    