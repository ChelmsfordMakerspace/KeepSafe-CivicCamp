//APIs to be used.
// Google Places API
// https://developers.google.com/places/documentation/search

//Constant Variables
var databaseURL = "https://raw.githubusercontent.com/ChelmsfordMakerspace/KeepSafe/master/keepsafe.json";
//window.ksPlaces

//Load the JSON File
function LoadDatabase(URL){
	$.getJSON(URL,function( data ){window.ksPlaces = data});
}

function RenderMap(selector,location = false){
	var divObject = $(selector)
}

//
function GetLocationInformation(Address){

}

//Main Steps
//Load the database.
LoadDatabase(databaseURL);
//Render the map of the users area. Do not set a location, because GeoLocation will do it for us.
RenderMap(".googlemap");
