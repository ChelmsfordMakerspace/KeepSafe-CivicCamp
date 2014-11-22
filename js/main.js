//APIs to be used.
// Google Places API
// https://developers.google.com/places/documentation/search

//Constant Variables
var databaseURL = "keepsafe.json";
var map;
var places;
var geocoder = new google.maps.Geocoder();
var clickPosition;
var defaultLocation = new google.maps.LatLng(51.8366866,0.697972);
var pinIcon = new google.maps.MarkerImage(
    "assets/logos/Keep_Safe_transparent.png",
    null, /* size is determined at runtime */
    null, /* origin is 0,0 */
    null, /* anchor is bottom center of the scaled image */
    new google.maps.Size(42, 68)
);  

//Load the JSON File
function LoadDatabase(URL){
	$.ajax(URL,{
		mimeType:"application/json",
		success:function( data )
		{
			window.ksPlaces = data;
			PopulateMap();
		}
	});
}

function PlacesSearchCallback( results,status ){
	if (status == "OK") {
		//Check place
		var infowindow = new google.maps.InfoWindow({
			map: map,
			position: clickPosition,
			content: "<h4>"+results[0].name+"</h4><b>Phone:</b>"+results[0].formatted_phone_number
		});
	}
	else if(status == "OVER_QUERY_LIMIT"){
		console.log("Google won't let us have any more requests.")
	}
	else{
		console.log("Captain, we have an " + status + " whenever we query for place locations.");
	}
}

function AddLocationMarker(locationObject){
	//Get a good latlang
	var request = {};
	geocoder.geocode( {'address': locationObject.postcode},function(results, status){
		if(status == "OK"){
			var marker = new google.maps.Marker({
				//icon: pinIcon,
				position: results[0].geometry.location,
				map: map,
			});	
			google.maps.event.addListener(marker, 'click', function() {
				clickPosition = marker.getPosition();
				map.setZoom(17);
				map.setCenter(clickPosition);
				places.textSearch({query:results[0].formatted_address},PlacesSearchCallback);
			});	
		}
	});
}
function loadMap(){
    //Create a maps
    map = new google.maps.Map($('.googlemap')[0],{zoom: 12,center:defaultLocation});
    places = new google.maps.places.PlacesService(map);
    FindCurrentPosition();
    LoadDatabase(databaseURL);
}

//Iterate through locations
function PopulateMap(){
	for(var district in window.ksPlaces){
		for(var iPlace = 0;iPlace<window.ksPlaces[district].length;iPlace++){
			AddLocationMarker(window.ksPlaces[district][iPlace]);
		}
	}
}

function FindCurrentPosition(){
	if(navigator.geolocation) {
        	navigator.geolocation.getCurrentPosition(function(position) {
			window.userPosition = position.coords;
            		map.setCenter(new google.maps.LatLng(position.coords.latitude,position.coords.longitude));
            		var infowindow = new google.maps.InfoWindow({
                		map: map,
		                position: new google.maps.LatLng(position.coords.latitude,position.coords.longitude),
                		content: 'You are here.'
            		});
		});
	}
}

loadMap();
