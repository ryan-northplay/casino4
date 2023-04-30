function GetPluginSettings()
{
	return {
		"name":			"Share",
		"id":			"Share",
		"version":		"3.0",
		"description":	"Share plugin by stctr.",
		"author":		"STCTR",
		"help url":		"http://www.google.com",
		"category":		"Web",
		"type":			"object",			// not in layout
		"rotatable":	false,
		"flags":		pf_singleglobal
	};
};

//////////////////////////////////////////////////////////////
// Conditions
AddCondition(0,	cf_trigger, "On upload finished", "Image Upload", "On upload finished", "Triggered when an upload request completes successfully.", "OnComplete");

//////////////////////////////////////////////////////////////
// Actions 
AddStringParam("Share", "Enter text to share on WhatsApp", "");
AddAction(1, 0,	"Share on WhatsApp", "WhatsApp", "Share on WhatsApp <i>{0}</i>", "Share on WhatsApp.", "GoToURL");

AddStringParam("Share", "Enter text to share on Twitter", "");
AddStringParam("URL", "Enter URL to share on Twitter", "\"http://\"");
AddAction(2, 0,	"Share on Twitter", "Twitter", "Share on Twitter <i>{0}</i>", "Share on Twitter.", "GoToURL2");

AddStringParam("Share", "Enter text to share on Line", "");
AddAction(3, 0,	"Share on Line", "Line", "Share on Line <i>{0}</i>", "Share on Line.", "GoToURL3");

AddStringParam("Title", "Enter title to share on Facebook", "");
AddStringParam("Description", "Enter description to share on Facebook", "");
AddStringParam("Redirect", "Enter redirect URL (Your website)", "\"http://\"");
AddStringParam("Image", "Enter image URL to share on Facebook", "\"http://\"");
AddStringParam("Name", "Enter name to share on Facebook", "");
AddAction(4, 0,	"Share on Facebook", "Facebook", "Share on Facebook <i>{0}</i>", "Share on Facebook.", "GoToURL4");

AddStringParam("URL", "Enter the full URL to like on Facebook", "\"http://\"");
AddComboParamOption("Standard");
AddComboParamOption("BoxCount");
AddComboParamOption("ButtonCount");
AddComboParamOption("Button");
AddComboParam("Layout", "Select one of the different layouts that are available for the plugin.");
AddComboParamOption("Yes");
AddComboParamOption("No");
AddComboParam("ShareButton", "Includes a Share button beside the Like button");
AddAction(5, 0,	"Like The URL", "Facebook", "Like the URL {0} (type <i>{1}</i>)", "Like The URL.", "GoToURL5");

AddStringParam("Title", "Enter title to share on Google Plus", "");
AddStringParam("Redirect", "Enter redirect URL (Your website)", "\"http://\"");
AddStringParam("Image", "Enter image URL to share on Google Plus", "\"http://\"");
AddAction(6, 0,	"Share on Google Plus", "GooglePlus", "Share on GooglePlus <i>{0}</i>", "Share on GooglePlus.", "GoToURL6");

AddStringParam("StoreID", "Enter your PlayStore BundleID for example: com.JelloJumper.WeebeStudio", "");
AddAction(7, 0,	"Rate in Google PlayStore", "PlayStore", "Rate in PlayStore <i>{0}</i>", "Rate in PlayStore.", "GoToURL7");

AddStringParam("GameName", "Name of your game.", "\"\"");
AddStringParam("Source", "The Image source to upload.", "CanvasSnapshot");
AddStringParam("PHPFile", "The PHP file URL.", "\"http://\"");
AddStringParam("FolderURL", "The Folder URL where IMG folder is located.", "\"http://\"");
AddAction(8, 0, "Upload Image", "Image Upload", "Upload <b>{0}</b>", "Upload image to the web.", "Post");
//////////////////////////////////////////////////////////////
// Expressions
//AddExpression(3, ef_return_number, "Absolute mouse Y", "Cursor", "AbsoluteY", "Get the mouse cursor Y co-ordinate on the canvas.");
AddExpression(0, ef_return_string, "Get last data", "SharePlugin", "LastData", "Get the data returned by the last successful request.");

ACESDone();

// Property grid properties for this plugin
var property_list = [
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
	return new IDEInstance(instance, this);
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
}

// Called by the IDE after all initialization on this instance has been completed
IDEInstance.prototype.OnCreate = function()
{
}

// Called by the IDE after a property has been changed
IDEInstance.prototype.OnPropertyChanged = function(property_name)
{
}
	
// Called by the IDE to draw this instance in the editor
IDEInstance.prototype.Draw = function(renderer)
{
}

// Called by the IDE when the renderer has been released (ie. editor closed)
// All handles to renderer-created resources (fonts, textures etc) must be dropped.
// Don't worry about releasing them - the renderer will free them - just null out references.
IDEInstance.prototype.OnRendererReleased = function()
{
}
