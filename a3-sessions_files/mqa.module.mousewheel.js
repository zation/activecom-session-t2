(function(){var E=window.MQA,H=E.Log.debug,F=E.extend,D=E.attach,C=E.Util.getLocalCoords,A=E.Util.boundZoomLevel,B=E.EventUtil.hitch,G=E.EventUtil.stop;function I(K,J){J=J||{};J.centerOnZoomIn=J.centerOnZoomIn||true;J.centerOnZoomOut=J.centerOnZoomOut||true;J.zoomInterval=J.zoomInterval||200;if(K._mouseWheel){K._mouseWheel.options=J}else{K._mouseWheel={init:false,enabled:false,timerId:null,newZoom:null,newLatLng:null,options:J}}}F(E.TileMap.prototype,{_resetMouseWheelZoom:function(){var J=this,K=J._mouseWheel.newZoom,L=J._mouseWheel.newLatLng;if(L&&K){J.setCenter(L,K)}else{if(K){J.setZoomLevel(K)}}J._mouseWheel.timerId=null;J._mouseWheel.newZoom=null;J._mouseWheel.newLatLng=null},_handleMouseWheelScroll:function(K){var L=this,K=(K?K:window.event),O=L._mouseWheel.options,J=L.getZoomLevel(),N=L._mouseWheel.newZoom||J,P;if(!L._mouseWheel.enabled){return }if(L._mouseWheel.timerId){clearTimeout(L._mouseWheel.timerId);L._mouseWheel.timerId=null}if(K.detail){P=K.detail<0?1:-1}else{if(K.wheelDelta){P=K.wheelDelta<0?-1:1;if(E.browser.name==="opera"){P=P*-1}}}N=N+P;if(Math.abs(N-J)>2){N=J+(P*2)}N=A(N);L._mouseWheel.newZoom=N;if((P>0&&O.centerOnZoomIn)||(P<0&&O.centerOnZoomOut)){var M=C(L.parent,K);L._mouseWheel.newLatLng=L.getCenterOffset(M,N)}L._mouseWheel.timerId=setTimeout(B(L,"_resetMouseWheelZoom"),O.zoomInterval);G(K)},enableMouseWheelZoom:function(L){var K=this,J="mousewheel";I(K,L);if(E.browser.name==="firefox"){J="DOMMouseScroll"}if(!K._mouseWheel.init){K.addDOMEvent(J);D(K,"_onDOMEvent","before",function(M){if(M.type==J){this._handleMouseWheelScroll(M,this)}});K._mouseWheel.init=true}K._mouseWheel.enabled=true},disableMouseWheelZoom:function(){this._mouseWheel.enabled=false}});E.Loader._moduleLoaded("mousewheel")})();