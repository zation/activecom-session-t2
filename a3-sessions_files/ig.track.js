/**
* 1) grab all trackable elements (currently image & anchor tags)
* 2) for each element:
*    a) copy orginal event values
*    b) overwrite with tracking functions for trackable events (currently onMouseOver, onMouseOut, onClick, and links)
*    c) log the element as loaded
* 3) on any event, execute the appropriate tracking function, log the event if needed, execute the original function, and follow any original link if needed
* all "log" actions are asynchronous calls to the Rec Tracking API, indicated by the api variable, as a POST with the element properties.
*    -- each POST is a JSON string of the original element properties plus the current token
*    -- calls in this version are:
*        - "/ln" for logging a load event
*        - "/clk" for logging a click
*        - "/hvr" for logging hover time above the hover minimum time, indicated by hvrMin in milliseconds
**/
var imgs = [], i=0, 
  hvrMin = 1000;
  hvrSecond = 5000;
// start timing a hover event 
function imgHvrStart(type,src) {
  imgs[src].onTmr = (new Date()).getTime();
  // do original onMouseOver event
  if ((typeof imgs[src].mOv).match(/function/)) imgs[src].mOv();
}
// end timing a hover event and log it
function imgHvrEnd(type,src) {

  var hvr = (new Date()).getTime() - imgs[src].onTmr;
  if (hvr >= hvrMin && imgs[src].cc<5) {
    imgs[src].onTmr = (new Date()).getTime();
	imgs[src].cc++;
	
	doAsync("hv",type,src,hvr,null);

  }
  // do original onMouseOut event
  if ((typeof imgs[src].mOu).match(/function/)) imgs[src].mOu();
}
// log a click
function imgClk(type,src) {
  doAsync("clk",type,src,null,null); //// ","POST",JSON.stringify(imgs[src]),false);
  // do original onClick event
  if ((typeof imgs[src].clk).match(/function/)) imgs[src].clk();
  /* we are no longer removing hrefs, so this is likely not needed
  // follow any hyperlink reference
  if (notEmpty(imgs[src].lnk)) {
    if (notEmpty(imgs[src].targ)) window.open(imgs[src].lnk,imgs[src].targ);
    else window.location.href = imgs[src].lnk;
  }
  */
}
// check if not undefined, null, or empty string equivalent
function notEmpty(obj) {
  return (obj != undefined && obj != null && obj != '');
}  
var inProcess = 0;



function a3ig_trace(aa) {
 ////document.getElementById("debug-output").innerHTML+='<br/>' + (new Date()).getTime() + ":" + aa;

}

// ajax call
function doAsync(eventType,type,id,hoverTime,extra) {

	if (eventType != null) {
		var msg = {"eventType":eventType,"eventBody":{"type":type,"isrc":id}};
		if (hoverTime != null) {
			msg.hoverTime = hoverTime;
		}
		if (extra != null) {
			msg.detail = extra;
		}
		a3ig_trace(JSON.stringify(msg));
		_igq.push(msg);
	}
	if (a3ig != null) {
		a3ig_trace("Updating...");
		a3ig.update();
	} else {
		setTimeout(function(){doAsync(null,null,null,null,null);},1000);
	}
/*
  console.log(url + ", " + meth + ", " + postwhat);
  var thefunc = towhat, req, nche=(url.indexOf('?')==-1?'?':'&')+'nche='+Math.random();
  try {
    req = new ActiveXObject("Microsoft.XMLHTTP");
  } catch(E) {
    if (typeof XMLHttpRequest != 'undefined') {
      try {
        req = new XMLHttpRequest();
      } catch(e) { req = false; }
    } else req = false;
  }
  if (req) {
    inProcess++;
    if (nocache) url += nche;
    req.open(meth, api+url, true);
    req.onreadystatechange = processReqChange;
    if (meth == "POST") req.setRequestHeader('Content-Type','application/x-www-form-urlencoded');
    req.send(postwhat);
  }
  
  function processReqChange() {
    if (req.readyState == 4) {
      try {
        if (req.status == 200) {
          inProcess--;
          if (thefunc != undefined && thefunc != "") eval(thefunc);
          if (inProcess == 0) { }
        } else {}
      } catch(e) { }
    }
  } */
}

function addTrk(type,di) {
  var isrc = '';
  var isrcT='';
  if (di) {
    if (di.src != undefined) isrc = di.src.replace(/[^a-z0-9\_\-]/ig,'_'); 
    if (di.href != undefined) {
      isrc = di.href.replace(/[^a-z0-9\_\-]/ig,'_');
      if (di.target != undefined && di.target != "") isrcT = di.target;
    }
  }
  ////imgs[isrc] = { src: di.src, clk: di.onclick, mOv: di.onmouseover, mOu: di.onmouseout, onTmr: 0, hvr: 0 };
  if (isrc != '') {
    imgs[isrc] = {  src: di.src, clk: di.onclick, mOv: di.onmouseover, mOu: di.onmouseout, cc:0,onTmr: 0, hvr: 0, targ: isrcT };
    if (di.parentNode != undefined && di.parentNode.href != undefined) {
      imgs[isrc].lnk = di.parentNode.href;
      //di.parentNode.href = "";
    } else if(di.hre != undefined) {
      imgs[isrc].lnk = di.href;
      //di.href = "";
    }
    di.onclick = function() { imgClk(type,isrc); };
    di.onmouseover = function() { imgHvrStart(type,isrc); };
    di.onmouseout = function() { imgHvrEnd(type,isrc); };
    ///doAsync("ld",type,isrc,null,imgs[isrc]);
  }
}


function followAll() {
 docImgs = document.getElementsByTagName("img"), docAnchs = document.getElementsByTagName("a"), docIfrms = document.getElementsByTagName("iframe");

	var i = 0;
// run through trackable elements, add tracking functions, log element loaded
 while (i<docImgs.length) {
  var di = docImgs[i];
  addTrk('img',di);
  i++;
}
a3ig_trace( i + " images traced");
i=0;
 while (i<docAnchs.length) {
  var di = docAnchs[i];
  addTrk("a",di);
  i++;
}
a3ig_trace( i + " anchors traced");
i=0;
 while (i<docIfrms.length) {
  var di = docIfrms[i];
  addTrk("iframe",di);
  i++;
}
a3ig_trace( i + " iframes traced");

}

