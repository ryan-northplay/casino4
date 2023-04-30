// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.plugins_, "cr.plugins_ not created");

/////////////////////////////////////
// Plugin class
// *** CHANGE THE PLUGIN ID HERE *** - must match the "id" property in edittime.js
//          vvvvvvvv
cr.plugins_.CordovaAdmobFree = function(runtime)
{
	this.runtime = runtime;
};

(function ()
{	

	/////////////////////////////////////
	// *** CHANGE THE PLUGIN ID HERE *** - must match the "id" property in edittime.js
	//                            vvvvvvvv
	var pluginProto = cr.plugins_.CordovaAdmobFree.prototype;
		
	/////////////////////////////////////
	// Object type class
	pluginProto.Type = function(plugin)
	{
		this.plugin = plugin;
		this.runtime = plugin.runtime;
	};

	var typeProto = pluginProto.Type.prototype;

	var bannerId="";
	var interId="";
	var test;
	var self;

	// called on startup for each object type
	typeProto.onCreate = function()
	{
	};

	/////////////////////////////////////
	// Instance class
	pluginProto.Instance = function(type)
	{
		this.type = type;
		this.runtime = type.runtime;
		
		// any other properties you need, e.g...
		// this.myValue = 0;
	};
	
	var instanceProto = pluginProto.Instance.prototype;

	// called whenever an instance is created
	instanceProto.onCreate = function()
	{
		// note the object is sealed after this call; ensure any properties you'll ever need are set on the object
		// e.g...
		// this.myValue = 0;

	self = this;
	test = false;

	if (this.properties[2]=='true') {test=true;}

	bannerId=this.properties[0];
	interId=this.properties[1];

	if (typeof window['plugins'] == 'undefined') {return;}else{

		window['plugins']['AdMob'].setOptions({publisherId: bannerId, interstitialAdId: interId, isTesting: test});
		
	}

	// set events

	// Banners

	document.addEventListener('onDismissAd', function () {
			self.runtime.trigger(cr.plugins_.CordovaAdmobFree.prototype.cnds.onBannerAdDismissed, self);
		});

	// Interstitials

	document.addEventListener('onDismissInterstitialAd', function () {
			self.runtime.trigger(cr.plugins_.CordovaAdmobFree.prototype.cnds.onInterstitialAdDismissed, self);
		});

	// Both

	document.addEventListener('onFailedToReceiveAd', function () {
			self.runtime.trigger(cr.plugins_.CordovaAdmobFree.prototype.cnds.onFailedAd, self);
		});

	};

	function indexToBoolean(index){

		switch (index) {
		case 0:		return true;
		case 1:		return false;
		}

	}

	function triggerEventBanner(){

		self.runtime.trigger(cr.plugins_.CordovaAdmobFree.prototype.cnds.onBannerAdpreloaded, self);

	}

	function triggerEventInter(){

		self.runtime.trigger(cr.plugins_.CordovaAdmobFree.prototype.cnds.onInterstitialAdPreloaded, self);

	}

	//////////////////////////////////////
	// Conditions
	function Cnds() {};

	// Banners

	Cnds.prototype.onBannerAdDismissed = function ()
	{
		return true;
	};

	Cnds.prototype.onBannerAdpreloaded = function ()
	{
		return true;
	};

	// Interstitials

	Cnds.prototype.onInterstitialAdPreloaded = function ()
	{
		return true;
	};

	Cnds.prototype.onInterstitialAdDismissed = function ()
	{
		return true;
	};

	// Both

	Cnds.prototype.onFailedAd = function ()
	{
		return true;
	};

	pluginProto.cnds = new Cnds();
	
	//////////////////////////////////////
	// Actions
	function Acts() {};

	//Banners
	
	Acts.prototype.removeBanner = function ()
	{
		if (typeof window['plugins'] == 'undefined') {return;}else{
		window['plugins']['AdMob'].destroyBannerView();}
	}

	Acts.prototype.loadBanner = function (pos, overlp)
	{
		if (typeof window['plugins'] == 'undefined') {return;}else{
		window['plugins']['AdMob'].createBannerView({bannerAtTop: indexToBoolean(pos), overlap: indexToBoolean(overlp)});

		document.addEventListener('onReceiveAd', triggerEventBanner);

		} // adSize: adSize,
	}

	Acts.prototype.showBanner = function ()
	{
		if (typeof window['plugins'] == 'undefined') {return;}else{
		window['plugins']['AdMob'].createBannerView();

		document.removeEventListener('onReceiveAd', triggerEventBanner);

		} 
	}

	//Inters

	Acts.prototype.loadAndShowInterstitial = function (overlp)
	{
		if (typeof window['plugins'] == 'undefined') {return;}else{
		window['plugins']['AdMob'].prepareInterstitial({adId: interId, overlap: indexToBoolean(overlp), autoShow: true});}
	}

	Acts.prototype.loadInterstitial = function (overlp)
	{
		if (typeof window['plugins'] == 'undefined') {return;}else{
		window['plugins']['AdMob'].createInterstitialView({adId: interId, overlap: indexToBoolean(overlp), autoShow: false});

		document.addEventListener('onReceiveInterstitialAd', triggerEventInter);

		}
	}

	Acts.prototype.showInterstitial = function ()
	{
		if (typeof window['plugins'] == 'undefined') {return;}else{
		window['plugins']['AdMob'].showInterstitialAd();

		document.removeEventListener('onReceiveInterstitialAd', triggerEventInter);

		}
	}

	pluginProto.acts = new Acts();
	
	//////////////////////////////////////
	// Expressions
	function Exps() {};
	pluginProto.exps = new Exps();

}());