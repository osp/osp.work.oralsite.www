(function( $ ) {
 
    $.fn.renderResources = function() {
    var parseUri = AA.utils.parseUri;
    
        var templates = {
            img:        _.template('<img src="<%= uri %>" />'),
            html5video: _.template('<video class="player" controls preload src="<%= uri %>" />'),
            html5audio: _.template('<audio class="player" controls src="<%= uri %>" />'),
            iframe:     _.template('<iframe src="<%= uri %>"></iframe>'),
            fallback:   _.template('<a href="<%= uri %>"><%= uri %></a>')
        };
        
        var mimeMap = function (mimeType) {
            /**
             * Find the templatename for a given mimetype
             * @param {string} mimeType - a mimetype i.e. "video/ogg"
             * @returns {string} the name of the corresponding template i.e. "html5video"
             */
            var mimes = {
                img: ["image/jpeg", "image/png", "image/gif"],
                html5video: ["video/ogg", "video/webm"],
                html5audio: ["audio/ogg"],
                iframe: ["text/html"]
            };
            for (var templName in mimes) {
                if (_.contains(mimes[templName], mimeType)) {
                    return templName;
                }
            }
            return "fallback";
        };
        
        var renderResource = function (uri, mimeType, filter, options) {
            var renderUri;
            
            var uriForCachedResource = function (uri, filter) {
                /**
                 * @param {string} uri - i.e. 'http://media.boingboing.net/wp-content/themes/2012/sundries/logo_bounce2012.gif'
                 * @param {string} filter - i.e 'size:160|bw'
                 * @returns {string} a url to a locally cached version of the resource. if a filter
                 * was specified, this is appended too, so that the uri refers to a cached version
                 * of the filtered version of the resource.
                 * Example: 
                 * http://localhost:8000/filters/cache/media.boingboing.net/wp-content/themes/2012/sundries/logo_bounce2012.gif..size:160..bw.gif
                 */
                var parsedUri = parseUri(uri);
                var extension = '.' + parsedUri.file.split('.').slice(-1);
                
                // the first 4 elements make up the cache location. TODO: set this in settings.
                return [    location.protocol,
                            '//',
                            location.host,
                            '/filters/cache/',
                            parsedUri.authority,
                            parsedUri.path,
                            filter ? '..' + filter.replace(/\|/g, '..') : '',
                            extension
                            ].join('');
            };
        
            var isLocal = function (uri) {
                if (uri.indexOf("http") === -1 || uri.indexOf(document.location.host) !== -1 || uri.indexOf("localhost") !== -1 || uri.indexOf("127.0.0.1") !== -1) {
                    return true;
                }
                return false;
            };
        
            // If the image is already local, and needs no filtering we can serve it as is:
            if (!filter && isLocal(uri)) {
                renderUri = uri;
            } else {
                renderUri = uriForCachedResource(uri, filter);
            }
            
            // TEST:
            // uriC = uriForCachedResource('http://media.boingboing.net/wp-content/themes/2012/sundries/logo_bounce2012.gif', 'size:160|bw');
            // console.log(uriC, uriC === location.protocol + '//' + location.host + '/filters/cache/media.boingboing.net/wp-content/themes/2012/sundries/logo_bounce2012.gif..size:160..bw.gif');
            
            var templateName = mimeMap(mimeType);
            return templates[templateName]({
                uri: renderUri,
                options: options
            });
        };
        
        return this.each(function(i, el) {
            $( el )
                .find("[rel='aa:embed']")
                    .each(function(i, el) {
                        var $el = $(el);
                        var uri = $el.attr('href');
                        var filter = $el.attr('data-filter');
                        var mimeType = AA.utils.path2mime(uri);
                        $el.replaceWith($(renderResource(uri, mimeType, filter)));
                    });
            
        });
 
    };
 
}( jQuery ));
