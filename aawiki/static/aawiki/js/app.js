$(function() {
    
    AA.router = new AA.Router();
    AA.userView = new AA.UserView({ model : new AA.UserModel({id : 'me' }) });
    AA.alertView = new AA.AlertView();
    
    Backbone.history.start({pushState: true, root: "/pages/"});
});
