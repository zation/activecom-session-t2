/*!
 * Active Network Interest Graph Library v1.0.1
 * http://active.com/
 *
 * Copyright (c) 2012 The Active Network, inc
 * Released under the MIT, BSD, and GPL Licenses.
 *
 * author: data-science
 * Date: July 23rd, 2012
 *
 * Summary: this code defines the basic AS3 IG network parameters, loads the socket.io client side library and then
 * connects to the node.js server and starts sending user actvity information.
 *
 */


var ig_load_ver = "1.0.1";
var ig_config = { 
	static_url : "http://ig-qa-web01.dev.activenetwork.com",
	socket_url : "http://ig-qa-web01.dev.activenetwork.com" };

function loadScript(url, callback){

    var script = document.createElement("script")
    script.type = "text/javascript";

    if (script.readyState){  //IE
        script.onreadystatechange = function(){
            if (script.readyState == "loaded" ||
                    script.readyState == "complete"){
                script.onreadystatechange = null;
                callback();
            }
        };
    } else {  //Others
        script.onload = function(){
            callback();
        };
    }

    script.src = url;
    document.getElementsByTagName("head")[0].appendChild(script);
}


function cookieGet( check_name ) {
        // first we'll split this cookie up into name/value pairs
        // note: document.cookie only returns name=value, not the other components
        var a_all_cookies = document.cookie.split( ';' );
        var a_temp_cookie = '';
        var cookie_name = '';
        var cookie_value = '';
        var b_cookie_found = false; // set boolean t/f default f

        for ( i = 0; i < a_all_cookies.length; i++ )
        {
                // now we'll split apart each name=value pair
                a_temp_cookie = a_all_cookies[i].split( '=' );


                // and trim left/right whitespace while we're at it
                cookie_name = a_temp_cookie[0].replace(/^\s+|\s+$/g, '');

                // if the extracted name matches passed check_name
                if ( cookie_name == check_name )
                {
                        b_cookie_found = true;
                        // we need to handle case where cookie has no value but exists (no = sign, that is):
                        if ( a_temp_cookie.length > 1 )
                        {
                                cookie_value = unescape( a_temp_cookie[1].replace(/^\s+|\s+$/g, '') );
                        }
                        // note that in cases where cookie is initialized but no value, null is returned
                        return cookie_value;
                        break;
                }
                a_temp_cookie = null;
                cookie_name = '';
        }
        if ( !b_cookie_found )
        {
                return null;
        }
}



/// prefix and suffix
var a3ig_h = ig_config.static_url;
var a3ig_token = cookieGet("a3ig-token_v6");
var a3ig_s = "?a3ig=" + a3ig_token + "&a3=" + a3ig_config.session_id; 
var a3ig = null;

var _igq = _igq || [];


/// errors are not handled. If any of the required files is missing, user activity will not be traced 
/// and no personnalized recommendatiosn will be sent to the client.

loadScript(a3ig_h + "/socket.io.min.js" , function() {

    loadScript( a3ig_h + "/ig.track.js" , function() {

	loadScript( a3ig_h + "/ig.main.js" + a3ig_s, function() { 

	});

	followAll();
});
});

