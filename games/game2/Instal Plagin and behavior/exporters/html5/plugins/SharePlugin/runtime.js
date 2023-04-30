// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.plugins_, "cr.plugins_ not created");

/////////////////////////////////////
// Plugin class
cr.plugins_.Share = function(runtime)
{
	this.runtime = runtime;
};

(function ()
{
	var isNodeWebkit = false;
	var path = null;
	var fs = null;
	var nw_appfolder = "";
	var pluginProto = cr.plugins_.Share.prototype;
		
	/////////////////////////////////////
	// Object type class
	pluginProto.Type = function(plugin)
	{
		this.plugin = plugin;
		this.runtime = plugin.runtime;
	};

	var typeProto = pluginProto.Type.prototype;

	typeProto.onCreate = function()
	{
	};

	/////////////////////////////////////
	// Instance class
	pluginProto.Instance = function(type)
	{
		this.type = type;
		this.runtime = type.runtime;
		this.lastData = "";
		this.curTag = "";
		this.progress = 0;
		this.timeout = -1;
		
		isNodeWebkit = this.runtime.isNodeWebkit;
		
		if (isNodeWebkit)
		{
			path = require("path");
			fs = require("fs");
			nw_appfolder = path["dirname"](process["execPath"]) + "\\";
		}
	};

	var instanceProto = pluginProto.Instance.prototype;

		var theInstance = null;
window["C2_AJAX_DCSide"] = function (event_, tag_, param_)
	{
		if (!theInstance)
			return;
		
		if (event_ === "success")
		{
			theInstance.curTag = tag_;
			theInstance.lastData = param_;
			theInstance.runtime.trigger(cr.plugins_.Share.prototype.cnds.OnComplete, theInstance);
		}
		else if (event_ === "error")
		{
			theInstance.curTag = tag_;
			theInstance.runtime.trigger(cr.plugins_.Share.prototype.cnds.OnError, theInstance);
		}
		else if (event_ === "progress")
		{
			theInstance.progress = param_;
			theInstance.curTag = tag_;
			theInstance.runtime.trigger(cr.plugins_.Share.prototype.cnds.OnProgress, theInstance);
		}
	};
		
	instanceProto.onCreate = function()
	{
		var self = this;
		theInstance = this;
		window.addEventListener("resize", function () {
			self.runtime.trigger(cr.plugins_.Share.prototype.cnds.OnResize, self);
		});
		
		// register for online/offline events
		if (typeof navigator.onLine !== "undefined")
		{
			window.addEventListener("online", function() {
				self.runtime.trigger(cr.plugins_.Share.prototype.cnds.OnOnline, self);
			});
			
			window.addEventListener("offline", function() {
				self.runtime.trigger(cr.plugins_.Share.prototype.cnds.OnOffline, self);
			});
		}
		
		// register for update ready event and progress events
		if (typeof window.applicationCache !== "undefined")
		{
			window.applicationCache.addEventListener('updateready', function() {
				self.runtime.loadingprogress = 1;
				self.runtime.trigger(cr.plugins_.Share.prototype.cnds.OnUpdateReady, self);
			});
			
			window.applicationCache.addEventListener('progress', function(e) {
				self.runtime.loadingprogress = e["loaded"] / e["total"];
			});
		}
		
		// document.addEventListener not supported in DC
		if (!this.runtime.isDirectCanvas)
		{
			// Listen for AppMobi's update event too
			document.addEventListener("appMobi.device.update.available", function() {
				self.runtime.trigger(cr.plugins_.Share.prototype.cnds.OnUpdateReady, self);
			});
			
			// Listen for PhoneGap's button events
			document.addEventListener("backbutton", function() {
				self.runtime.trigger(cr.plugins_.Share.prototype.cnds.OnBackButton, self);
			});
			
			document.addEventListener("menubutton", function() {
				self.runtime.trigger(cr.plugins_.Share.prototype.cnds.OnMenuButton, self);
			});
			
			document.addEventListener("searchbutton", function() {
				self.runtime.trigger(cr.plugins_.Share.prototype.cnds.OnSearchButton, self);
			});
			
			// Listen for Tizen's hardware key events
			document.addEventListener("tizenhwkey", function (e) {
				var ret;
				
				switch (e["keyName"]) {
				case "back":
					ret = self.runtime.trigger(cr.plugins_.Share.prototype.cnds.OnBackButton, self);
					
					// If nothing was triggered, end the application with the Back button
					if (!ret)
					{
						if (window["tizen"])
							window["tizen"]["application"]["getCurrentApplication"]()["exit"]();
					}
						
					break;
				case "menu":
					ret = self.runtime.trigger(cr.plugins_.Share.prototype.cnds.OnMenuButton, self);
					
					// Only prevent default if something was triggered
					if (!ret)
						e.preventDefault();
						
					break;
				}
			});
		}
		
		// In Windows Phone 8.1, listen for back click events
		if (this.runtime.isWindowsPhone81)
		{
			WinJS["Application"]["onbackclick"] = function (e)
			{
				// If anything triggers, return true to cancel default behavior.
				return !!self.runtime.trigger(cr.plugins_.Share.prototype.cnds.OnBackButton, self);
			};
		}
		
		// Share visibility change events as well as platform-specific events like phonegap's
		// pause and resume will suspend the runtime.  handle this event as the 'page visible' trigger
		this.runtime.addSuspendCallback(function(s) {
			if (s)
			{
				self.runtime.trigger(cr.plugins_.Share.prototype.cnds.OnPageHidden, self);
			}
			else
			{
				self.runtime.trigger(cr.plugins_.Share.prototype.cnds.OnPageVisible, self);
			}
		});
		
		this.is_arcade = (typeof window["is_scirra_arcade"] !== "undefined");
	};
		instanceProto.saveToJSON = function ()
	{
		return { "lastData": this.lastData };
	};
		instanceProto.loadFromJSON = function (o)
	{
		this.lastData = o["lastData"];
		this.curTag = "";
		this.progress = 0;
	};
	var next_request_headers = {};
	
	instanceProto.doRequest = function (tag_, url_, method_, data_)
	{
		// In directCanvas: forward request to webview layer
		if (this.runtime.isDirectCanvas)
		{
			AppMobi["webview"]["execute"]('C2_AJAX_WebSide("' + tag_ + '", "' + url_ + '", "' + method_ + '", ' + (data_ ? '"' + data_ + '"' : "null") + ');');
			return;
		}
		
		// Create a context object with the tag name and a reference back to this
		var self = this;
		var request = null;
		
		var doErrorFunc = function ()
		{
			self.curTag = tag_;
			self.runtime.trigger(cr.plugins_.Share.prototype.cnds.OnError, self);
		};
		
		var errorFunc = function ()
		{
			// In node-webkit, try looking up the file on disk instead since it wasn't found in the project.
			if (isNodeWebkit)
			{
				var filepath = nw_appfolder + url_;
				
				if (fs["existsSync"](filepath))
				{
					fs["readFile"](filepath, {"encoding": "utf8"}, function (err, data) {
						if (err)
						{
							doErrorFunc();
							return;
						}
						
						self.lastData = data.replace(/\r\n/g, "\n")
						self.runtime.trigger(cr.plugins_.Share.prototype.cnds.OnComplete, self);
					});
				}
				else
					doErrorFunc();
			}
			else
				doErrorFunc();
		};
			
		var progressFunc = function (e)
		{
			if (!e["lengthComputable"])
				return;
				
			self.progress = e.loaded / e.total;
			self.curTag = tag_;
			self.runtime.trigger(cr.plugins_.Share.prototype.cnds.OnProgress, self);
		};
			
		try
		{
			// Windows Phone 8 can't AJAX local files using the standards-based API, but
			// can if we use the old-school ActiveXObject. So use ActiveX on WP8 only.
			if (this.runtime.isWindowsPhone8)
				request = new ActiveXObject("Microsoft.XMLHTTP");
			else
				request = new XMLHttpRequest();
			
			request.onreadystatechange = function()
			{
				if (request.readyState === 4)
				{
					self.curTag = tag_;
					
					if (request.responseText)
						self.lastData = request.responseText.replace(/\r\n/g, "\n");		// fix windows style line endings
					else
						self.lastData = "";
					
					if (request.status >= 400)
						self.runtime.trigger(cr.plugins_.Share.prototype.cnds.OnError, self);
					else
					{
						// In node-webkit, don't trigger 'on success' with empty string if file not found
						if (!isNodeWebkit || self.lastData.length)
							self.runtime.trigger(cr.plugins_.Share.prototype.cnds.OnComplete, self);
					}
				}
			};
			
			if (!this.runtime.isWindowsPhone8)
			{
				request.onerror = errorFunc;
				request.ontimeout = errorFunc;
				request.onabort = errorFunc;
				request["onprogress"] = progressFunc;
			}
			
			request.open(method_, url_);
			
			if (!this.runtime.isWindowsPhone8)
			{
				// IE requires timeout be set after open()
				if (this.timeout >= 0 && typeof request["timeout"] !== "undefined")
					request["timeout"] = this.timeout;
			}
			
			// Workaround for CocoonJS bug: property exists but is not settable
			try {
				request.responseType = "text";
			} catch (e) {}
			
			if (data_)
			{
				if (request["setRequestHeader"])
				{
					request["setRequestHeader"]("Content-Type", "application/x-www-form-urlencoded");
				}
			}
			
			// Apply custom headers
			if (request["setRequestHeader"])
			{
				var p;
				for (p in next_request_headers)
				{
					if (next_request_headers.hasOwnProperty(p))
					{
						try {
							request["setRequestHeader"](p, next_request_headers[p]);
						}
						catch (e) {}
					}
				}
				
				// Reset for next request
				next_request_headers = {};
			}

			if (data_)
				request.send(data_);
			else
				request.send();
			
		}
		catch (e)
		{
			errorFunc();
		}
	};
	/**BEGIN-PREVIEWONLY**/
	instanceProto.getDebuggerValues = function (propsections)
	{
		propsections.push({
			"title": "Share",
			"properties": [

			]
		});
	};
	/**END-PREVIEWONLY**/
	
	
	//////////////////////////////////////
	// Conditions
	function Cnds() {};

	Cnds.prototype.OnComplete = function ()
	{
		return cr.equals_nocase("shareplugin", this.curTag);
	};
	
	Cnds.prototype.CookiesEnabled = function()
	{
		return navigator ? navigator.cookieEnabled : false;
	};
	
	Cnds.prototype.IsOnline = function()
	{
		return navigator ? navigator.onLine : false;
	};
	
	Cnds.prototype.HasJava = function()
	{
		return navigator ? navigator.javaEnabled() : false;
	};
	
	Cnds.prototype.OnOnline = function()
	{
		return true;
	};
	
	Cnds.prototype.OnOffline = function()
	{
		return true;
	};
	
	Cnds.prototype.IsDownloadingUpdate = function ()
	{
		if (typeof window["applicationCache"] === "undefined")
			return false;
		else
			return window["applicationCache"]["status"] === window["applicationCache"]["DOWNLOADING"];
	};
	
	Cnds.prototype.OnUpdateReady = function ()
	{
		return true;
	};
	
	Cnds.prototype.PageVisible = function ()
	{
		return !this.runtime.isSuspended;
	};
	
	Cnds.prototype.OnPageVisible = function ()
	{
		return true;
	};
	
	Cnds.prototype.OnPageHidden = function ()
	{
		return true;
	};
	
	Cnds.prototype.OnResize = function ()
	{
		return true;
	};
	
	Cnds.prototype.IsFullscreen = function ()
	{
		return !!(document["mozFullScreen"] || document["webkitIsFullScreen"] || document["fullScreen"] || this.runtime.isNodeFullscreen);
	};
	
	Cnds.prototype.OnBackButton = function ()
	{
		return true;
	};
	
	Cnds.prototype.OnMenuButton = function ()
	{
		return true;
	};
	
	Cnds.prototype.OnSearchButton = function ()
	{
		return true;
	};
	
	Cnds.prototype.IsMetered = function ()
	{
		var connection = navigator["connection"] || navigator["mozConnection"] || navigator["webkitConnection"];
		
		if (!connection)
			return false;
			
		return connection["metered"];
	};
	
	Cnds.prototype.IsCharging = function ()
	{
		var battery = navigator["battery"] || navigator["mozBattery"] || navigator["webkitBattery"];
		
		if (!battery)
			return true;
		
		return battery["charging"];
	};
	
	Cnds.prototype.IsPortraitLandscape = function (p)
	{
		var current = (window.innerWidth <= window.innerHeight ? 0 : 1);
		
		return current === p;
	};
	
	pluginProto.cnds = new Cnds();

	//////////////////////////////////////
	// Actions
	function Acts() {};

	Acts.prototype.GoToURL = function (share)
	{

	share = "whatsapp://send?text=" + encodeURI(share);
	
		if (this.runtime.isCocoonJs)
			CocoonJS["App"]["openURL"](share);
		else if (this.runtime.isEjecta)
			ejecta["openURL"](share);
		else if (this.runtime.isWinJS)
			Windows["System"]["Launcher"]["launchUriAsync"](new Windows["Foundation"]["Uri"](share));
		else if (navigator["app"] && navigator["app"]["loadUrl"])
			navigator["app"]["loadUrl"](share, { "openExternal": true });
		else if (!this.is_arcade && !this.runtime.isDomFree)
		{
					if (this.runtime.isMobile)
					{
					window.location = share;
					}
		}
	};
	Acts.prototype.GoToURL2 = function (share, url)
	{

	share = "https://twitter.com/intent/tweet?text=" + encodeURI(share) + "&url=" + encodeURI(url);
	
		if (this.runtime.isCocoonJs)
			CocoonJS["App"]["openURL"](share);
		else if (this.runtime.isEjecta)
			ejecta["openURL"](share);
		else if (this.runtime.isWinJS)
			Windows["System"]["Launcher"]["launchUriAsync"](new Windows["Foundation"]["Uri"](share));
		else if (navigator["app"] && navigator["app"]["loadUrl"])
			navigator["app"]["loadUrl"](share, { "openExternal": true });
		else if (!this.is_arcade && !this.runtime.isDomFree)
		{
					window.open (share, "\"NewWindow\"");
		}
	};
	
		Acts.prototype.GoToURL3 = function (share)
	{

	share = "line://msg/text/" + encodeURI(share);
	
		if (this.runtime.isCocoonJs)
			CocoonJS["App"]["openURL"](share);
		else if (this.runtime.isEjecta)
			ejecta["openURL"](share);
		else if (this.runtime.isWinJS)
			Windows["System"]["Launcher"]["launchUriAsync"](new Windows["Foundation"]["Uri"](share));
		else if (navigator["app"] && navigator["app"]["loadUrl"])
			navigator["app"]["loadUrl"](share, { "openExternal": true });
		else if (!this.is_arcade && !this.runtime.isDomFree)
		{
					if (this.runtime.isMobile)
					{
					window.location = share;
					}
		}
	};
	
	Acts.prototype.GoToURL4 = function (title, description, redirect, image, name)
	{

	var share = "https://www.facebook.com/sharer/sharer.php?u=http://weebe.nl/share.php?title=" + encodeURIComponent(title).replace(/'/g,"%27").replace(/"/g,"%22") + "%26image=" + encodeURIComponent(image).replace(/'/g,"%27").replace(/"/g,"%22") + "%26name=" + encodeURIComponent(name).replace(/'/g,"%27").replace(/"/g,"%22") + "%26description=" + encodeURIComponent(description).replace(/'/g,"%27").replace(/"/g,"%22") + "%26redirect=" + encodeURIComponent(redirect).replace(/'/g,"%27").replace(/"/g,"%22") + "%26random=" + encodeURIComponent(Math.random()).replace(/'/g,"%27").replace(/"/g,"%22");
	
		if (this.runtime.isCocoonJs)
			CocoonJS["App"]["openURL"](share);
		else if (this.runtime.isEjecta)
			ejecta["openURL"](share);
		else if (this.runtime.isWinJS)
			Windows["System"]["Launcher"]["launchUriAsync"](new Windows["Foundation"]["Uri"](share));
		else if (navigator["app"] && navigator["app"]["loadUrl"])
			navigator["app"]["loadUrl"](share, { "openExternal": true });
		else if (!this.is_arcade && !this.runtime.isDomFree)
		{
					window.open (share, "\"NewWindow\"");
		}
	};

	Acts.prototype.GoToURL5 = function (url, layout, sharebutton)
	{
	var finallayout = "";
	var finalshare = "";
	if (layout === 3)		// Button
				finallayout = "button";
	else if (layout === 2)	// ButtonCount
				finallayout = "button_count";
	else if (layout === 1)	// BoxCount
		        finallayout = "box_count";
	else{				// standard
				 finallayout = "standard";
				}
	if (sharebutton === 1)		// No
				 finalshare = "false";
				else{	// Yes
				 finalshare = "true";
				}			
				
			url = "https://www.facebook.com/plugins/like.php?href=" + encodeURIComponent(url) + "&layout=" + finallayout +"&action=like&show_faces=false&share=" + finalshare + "&height=150"

		if (this.runtime.isCocoonJs)
			CocoonJS["App"]["openURL"](url);
		else if (this.runtime.isEjecta)
			ejecta["openURL"](url);
		else if (this.runtime.isWinJS)
			Windows["System"]["Launcher"]["launchUriAsync"](new Windows["Foundation"]["Uri"](url));
		else if (navigator["app"] && navigator["app"]["loadUrl"])
			navigator["app"]["loadUrl"](url, { "openExternal": true });
		else if (!this.is_arcade && !this.runtime.isDomFree)
		{
	window.open (url);
		}
	};
	
		Acts.prototype.GoToURL6 = function (title, redirect, image)
	{
  // title = title.replace(" ","|")
   var newstring = title.split(' ').join('|');
	var share = "https://plus.google.com/share?url=http://weebe.nl/gshare.php?title=" + encodeURIComponent(newstring).replace(/'/g,"%27").replace(/"/g,"%22") + "%26image=" + encodeURIComponent(image).replace(/'/g,"%27").replace(/"/g,"%22") + "%26redirect=" + encodeURIComponent(redirect).replace(/'/g,"%27").replace(/"/g,"%22");
	
		if (this.runtime.isCocoonJs)
			CocoonJS["App"]["openURL"](share);
		else if (this.runtime.isEjecta)
			ejecta["openURL"](share);
		else if (this.runtime.isWinJS)
			Windows["System"]["Launcher"]["launchUriAsync"](new Windows["Foundation"]["Uri"](share));
		else if (navigator["app"] && navigator["app"]["loadUrl"])
			navigator["app"]["loadUrl"](share, { "openExternal": true });
		else if (!this.is_arcade && !this.runtime.isDomFree)
		{
					window.open (share, "\"NewWindow\"");
		}
	};
	
			Acts.prototype.GoToURL7 = function (storeid)
	{

	storeid = "market://details?id=" + encodeURI(storeid) + "&write_review=true";
	
		if (this.runtime.isCocoonJs)
			CocoonJS["App"]["openURL"](storeid);
		else if (this.runtime.isEjecta)
			ejecta["openURL"](storeid);
		else if (this.runtime.isWinJS)
			Windows["System"]["Launcher"]["launchUriAsync"](new Windows["Foundation"]["Uri"](storeid));
		else if (navigator["app"] && navigator["app"]["loadUrl"])
			navigator["app"]["loadUrl"](storeid, { "openExternal": true });
		else if (!this.is_arcade && !this.runtime.isDomFree)
		{
					if (this.runtime.isMobile)
					{
					window.location = storeid;
					}
		}
	};
	
	Acts.prototype.Post = function (gamename, source, phpfile, folderurl)
	{
	var tag_ = "shareplugin";
	var method_ = "POST";
	var data_ = "foto=" + source + "&nome=" + gamename + "&folder=" + folderurl;
		this.doRequest(tag_, phpfile, method_, data_);
	};
	
	pluginProto.acts = new Acts();
	
	//////////////////////////////////////
	// Expressions
	function Exps() {};
		Exps.prototype.LastData = function (ret)
	{
		ret.set_string(this.lastData);
	};
	pluginProto.exps = new Exps();
	
}());