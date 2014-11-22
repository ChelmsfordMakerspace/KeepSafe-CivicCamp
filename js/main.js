//APIs to be used.
// Google Places API
// https://developers.google.com/places/documentation/search

//Constant Variables
var databaseURL = "keepsafe.json";
var map;
var places;
var geocoder = new google.maps.Geocoder();
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
				position: results[0].geometry.location,
				map: map,
				title:"NoNameSet"
			});	
			google.maps.event.addListener(marker, 'click', function() {
				//Do a places search.
				map.setZoom(8);
				map.setCenter(marker.getPosition());
			});	
		}
	});
	places.textSearch(request,PlacesSearchCallback);
}
function loadMap(){
    //Create a maps
    map = new google.maps.Map($('.googlemap')[0],{zoom: 15});
	places = new google.maps.places.PlacesService(map);
    if(navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(position) {
			window.userPosition = position.coords;
            map.setCenter(new google.maps.LatLng(position.coords.latitude,position.coords.longitude));
            var infowindow = new google.maps.InfoWindow({
                map: map,
                position: new google.maps.LatLng(position.coords.latitude,position.coords.longitude),
                content: 'You are here.'
            });
            
            //Remove listings
            var noPoi = [
			{
				featureType: "poi",
				stylers: [
				  { visibility: "off" }
				]   
			}
			];
			map.setOptions({styles: noPoi});
			
		LoadDatabase(databaseURL);
        });
    }
    else{
            //Err, dunno.
            alert("Sorry, we could not find you!"); //Replace this with something less alarming.
    }
}

loadMap();

//Iterate through locations
function PopulateMap(){
	for(var district in window.ksPlaces){
		for(var iPlace = 0;iPlace<window.ksPlaces[district].length;iPlace++){
			setTimeout(AddLocationMarker(window.ksPlaces[district][iPlace]),iPlace); //Make sure it fires with a decent interval
		}
	}
}
