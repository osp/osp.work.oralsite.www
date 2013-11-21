/*
CREATE PAGE

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
    

/*
LOGOUT:

$.ajax({
    url: 'http://localhost:8000/pages/api/v1/user/logout',
    type: 'GET',
    contentType: 'application/json',
    processData: false,
    succes: function(data) { console.log(data); },
    error: function(error) { console.log(error); }
});
*/

/*

LOGIN:

var data = JSON.stringify({
    "username"   : "username",
    "password"  : "password"
});

$.ajax({
    url: 'http://localhost:8000/pages/api/v1/user/login/',
    type: 'POST',
    contentType: 'application/json',
    data: data,
    dataType: 'json',
    processData: false,
    succes: function(data) { console.log(data); },
    error: function(error) { console.log(error); }
});

*/