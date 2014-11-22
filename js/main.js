//APIs to be used.
// Google Places API
// https://developers.google.com/places/documentation/search

//Constant Variables
var databaseURL = "keepsafe.json";
var map;
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

function AddLocationMarker(locationObject){
	//Get a good latlang
	var request = {};
	request.query = locationObject.name + '+' + locationObject.postcode;
	service = new google.maps.places.PlacesService(map);
	service.textSearch(request,function( results,status )
		{
			if (status == google.maps.places.PlacesServiceStatus.OK) {
				var marker = new google.maps.Marker({
					position: results[0].geometry.LatLng,
					map: map,
					title:results[0].name
				});
			}
			else if(status == "OVER_QUERY_LIMIT"){
				console.log("Google won't let us have any more requests.")
			}
			else{
				console.log("Captain, we have an " + status + " whenever we query for place locations.");
			}

		}
	);
}
function loadMap(){
    //Create a maps
    map = new google.maps.Map($('.googlemap')[0],{zoom: 15});

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
			AddLocationMarker(window.ksPlaces[district][iPlace])
		}
	}
}
