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
 * Summary: this class is automatically open a socket with the node.js server and starts sending user activity information.
 * There is one callback for receiving recommendations.
 *
 */

function cookieSet(nm, val, days) {
   var edate = new Date();
   edate.setDate(edate.getDate() + days);
   var c_value = escape(val) + ((days == null) ? "" : "; expires=" + edate.toUTCString());
   document.cookie = nm + "=" + c_value;

 }


function a3ig_update(self_enabled, self_token, self_socket) {
               if (self_enabled == false) {

			a3ig_trace("socket not ready... retrying...");
			 setTimeout(function(){a3ig_update(a3ig.enabled, a3ig.token, a3ig.ig_socket);},2000);
                        return;
                }


	while(true) {

		if (_igq.length==0) {
			break; 
		}
		e = _igq.shift();
		if ( typeof( e ) == "undefined") {
			break;
		}

                        msg = {payload:e};
                        if (self_token != null) {
                                msg.token = self_token;
                        }
			a3ig_trace("Sending: " + JSON.stringify(msg));
                        self_socket.emit('channel',msg);
        }
}

var a3ig_topicRecommendation = "{}";
var a3ig_lastCommand = "";

var a3ig = new function() {
   
    this.enabled = false;

	this.topicRecommendation = "{}";

    this.update = function() {

	a3ig_update( self.enabled, self.token, self.ig_socket );
    }
 
    this.push = function(eventType,eventBody) {
		_igq.push({eventType:eventType, "eventBody":eventBody});
		a3ig_update( self.enabled, self.token, self.ig_socket );
	};
	this.process = function(data) {
	}

	this.typeAhead = function(searchContent) {
			self.ig_socket.emit('typeahead', {payload:{text:searchContent}, token:self.token});
	}

    
    this.connect = function() {

		self.pageView = a3ig_config
		self.pageView.url = document.URL;
		self.pageView.userAgent = navigator.userAgent;
		self.pageView.title = document.title;
		self.token = cookieGet("a3ig-token_v6");
		self.ig_socket = io.connect("http://ig-qa-web01.dev.activenetwork.com:3000",{secure:"http"=="https"});

		self.ig_socket.on('typeahead', function (data) {  
				a3ig_typeahead_callback(data);
		});

		self.ig_socket.on('channel', function (data) {
                
				a3ig_lastCommand = data;
				msg = {};
				self.token = data.token;
				cookieSet("a3ig-token_v6", self.token, 712);
				if (a3ig_callback != undefined) {
					if (data.popular != undefined && data.popular.recommendation != undefined) msg = data.popular.recommendation;
					if (data.recApi != undefined) msg.a3igVersioni = data.recApi;
					msg.status = 'success';
					// a3ig_callback(msg);	
				}
				a3ig_update( self.enabled, self.token, self.ig_socket );
  		});

		self.ig_socket.on('recommendations', function (data) {
			a3ig_topicRecommendation = data;
 		});
		

		self.ig_socket.on('connect', function () { 
			self.enabled = true;
			self.ig_socket.emit('channel', {payload:{eventType:"pageView", "eventBody":pageView}, token:self.token});
			 })
		self.ig_socket.on('reconnect', function () { self.enabled = true; })
		self.ig_socket.on('error', function () { self.enabled = false; })
};
}

a3ig.connect();



