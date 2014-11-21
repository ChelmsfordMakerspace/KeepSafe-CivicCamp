//APIs to be used.
// Google Places API
// https://developers.google.com/places/documentation/search

//Constant Variables
var databaseURL = "keepsafe.json";
var map;
//window.ksPlaces
//Load the JSON File
function LoadDatabase(URL){
	$.ajax(URL,{
	                mimeType:"application/json",
	                success:function( data )
				    {
					    window.ksPlaces = data;
				    }
				});
}

function GetLocationInformation(Address){

}

//Main Steps
//Load the database.
LoadDatabase(databaseURL);
function loadMap(){
    //Create a maps
    map = new google.maps.Map($('.googlemap')[0],{zoom: 15});

    if(navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(position) {
            var pos = new google.maps.LatLng(position.coords.latitude,position.coords.longitude);
            map.setCenter(pos);
            var infowindow = new google.maps.InfoWindow({
                map: map,
                position: pos,
                content: 'You are here.'
            });

        });
    }
    else{
            //Err, dunno.
            alert("Sorry, we could not find you!"); //Replace this with something less alarming.
    }
}


google.maps.event.addDomListener(window, 'load', loadMap);
