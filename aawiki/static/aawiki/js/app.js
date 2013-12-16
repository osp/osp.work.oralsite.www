$(function() {
    // load the void player, so that later it can be initialised to turn the page
    // and annotation boxes into drivers.
    Popcorn.player( "baseplayer" );

    // loads the views that change from page to page
    AA.router = new AA.Router();
    
    // listen for annotations ( knows how to handle new annotations added at runtime )
    AA.listeningAnnotations();
    
    // The user and alert-view are independent of page-to-page navigation
    AA.userView = new AA.UserView({ model : new AA.UserModel({id : 'me' }) });
    AA.alertView = new AA.AlertView();
    
    // make Backbone handle page changes
    // TODO: this is not actually active, as long as we don’t do a
    // preventDefault() on hyperlink-click event.
    // We can enable this later on, as for now it is OK to actually reload all the time—
    // it makes debugging easier.
    Backbone.history.start({pushState: true, root: "/pages/"});
});
