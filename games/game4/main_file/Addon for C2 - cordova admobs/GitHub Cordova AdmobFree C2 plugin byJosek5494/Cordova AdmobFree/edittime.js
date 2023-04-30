function GetPluginSettings()
{
	return {
		"name":			"CordovaAdmobFree",				// as appears in 'insert object' dialog, can be changed as long as "id" stays the same
		"id":			"CordovaAdmobFree",				// this is used to identify this plugin and is saved to the project; never change it
		"version":		"1.0",					// (float in x.y format) Plugin version - C2 shows compatibility warnings based on this
		"description":	"Show adds calling cordova-plugin-admob-free by Ratson, or cordova-plugin-admob-simple by Sunnycupertino.",
		"author":		"Josek5494",
		"help url":		"http://hermitsdevelopment.blogspot.com.es/",
		"category":		"Plugins by Josek5494",				// Prefer to re-use existing categories, but you can set anything here
		"type":			"object",				// either "world" (appears in layout and is drawn), else "object"
		"rotatable":	false,					// only used when "type" is "world".  Enables an angle property on the object.
		"flags":	pf_singleglobal
	};
};

////////////////////////////////////////
// Conditions

// Banners

AddCondition(4, cf_trigger, "On banner ad preloaded", "Banners", "On banner ad preloaded", 
	"Triggered when a banner ad is preloaded.", "onBannerAdpreloaded");

AddCondition(0, cf_trigger, "On banner ad dismissed", "Banners", "On banner ad dismissed", 
	"Triggered when a banner ad is dismissed.", "onBannerAdDismissed");

// Interstitials

AddCondition(1, cf_trigger, "On interstitial ad preloaded", "Interstitials", "On interstitial ad preloaded", 
	"Triggered when a interstitial is received and ready to show.", "onInterstitialAdPreloaded");

AddCondition(2, cf_trigger, "On interstitial ad dismissed", "Interstitials", "On interstitial ad dismissed", 
	"Triggered when a interstitial ad is dismissed.", "onInterstitialAdDismissed");

// Both

AddCondition(3, cf_trigger, "On ad failed", "Both", "On ad failed", 
	"Triggered when an ad fails to load.", "onFailedAd");

////////////////////////////////////////
// Actions

// Banners ///////////////////////////////

// Remove

AddAction(0, af_none, "Remove banner", "Banners", "Remove the banner ad", 
	"Remove the currently showing banner ad.", "removeBanner");

// Load

AddComboParamOption("TOP CENTER");
AddComboParamOption("BOTTOM CENTER");
AddComboParam("Position", "Choose where the banner ad will appear.");
AddComboParamOption("True");
AddComboParamOption("False");
AddComboParam("Overlap", "Set to true if want to show the ad overlapping.");
AddAction(1, af_none, "Load a banner", "Banners", "Load a banner ad", "Start loading a banner ad. Be sure the banner is loaded before show(just wait a few seconds)", "loadBanner");

// Show

AddAction(2, af_none, "Show a banner", "Banners", "Show a banner ad", "Show a preloaded banner ad. Be sure the banner is loaded before show(just wait a few seconds)", "showBanner");

// Interstitials /////////////////////////////////////

// Load and show

AddComboParamOption("True");
AddComboParamOption("False");
AddComboParam("Overlap", "Set to true if want to show the ad overlapping.");
AddAction(3, af_none, "Load and show an interstitial", "Interstitials", "Load and show an interstitial", "Start loading an interstitial and autoshow when ready.", "loadAndShowInterstitial");

// Only load

AddComboParamOption("True");
AddComboParamOption("False");
AddComboParam("Overlap", "Set to true if want to show the ad overlapping.");
AddAction(4, af_none, "Load an interstitial", "Interstitials", "Load an interstitial", 
	"Start loading an interstitial. Be sure the interstitial is loaded before show(just wait a few seconds)", "loadInterstitial");

// Show

AddAction(5, af_none, "Show a preloaded interstitial", "Interstitials", "Show a preloaded interstitial", 
	"Show a preloaded interstitial. Be sure the interstitial is loaded before show(just wait a few seconds)", "showInterstitial");

////////////////////////////////////////
ACESDone();

////////////////////////////////////////
// Properties

var property_list = [

    new cr.Property(ept_text,   "Banner ID",  "", "Ad unit ID for the banner ad."),
    new cr.Property(ept_text,   "Interstitial ID", "", "Ad unit ID for the interstitials."),
    new cr.Property(ept_combo,	"Test Mode", "true", "Show test ads.","false|true")


];
	
// Called by IDE when a new object type is to be created
function CreateIDEObjectType()
{
	return new IDEObjectType();
}

// Class representing an object type in the IDE
function IDEObjectType()
{
	assert2(this instanceof arguments.callee, "Constructor called as a function");
}

// Called by IDE when a new object instance of this type is to be created
IDEObjectType.prototype.CreateInstance = function(instance)
{
	return new IDEInstance(instance);
}

// Class representing an individual instance of an object in the IDE
function IDEInstance(instance, type)
{
	assert2(this instanceof arguments.callee, "Constructor called as a function");
	
	// Save the constructor parameters
	this.instance = instance;
	this.type = type;
	
	// Set the default property values from the property table
	this.properties = {};
	
	for (var i = 0; i < property_list.length; i++)
		this.properties[property_list[i].name] = property_list[i].initial_value;
		
	// Plugin-specific variables
	// this.myValue = 0...
}

// Called when inserted via Insert Object Dialog for the first time
IDEInstance.prototype.OnInserted = function()
{
}

// Called when double clicked in layout
IDEInstance.prototype.OnDoubleClicked = function()
{
}

// Called after a property has been changed in the properties bar
IDEInstance.prototype.OnPropertyChanged = function(property_name)
{
}

// For rendered objects to load fonts or textures
IDEInstance.prototype.OnRendererInit = function(renderer)
{
}

// Called to draw self in the editor if a layout object
IDEInstance.prototype.Draw = function(renderer)
{
}

// For rendered objects to release fonts or textures
IDEInstance.prototype.OnRendererReleased = function(renderer)
{
}