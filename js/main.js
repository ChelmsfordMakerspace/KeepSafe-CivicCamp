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
var postcodesTolatlng = {};
var currentProgress = 0;
var maxProgress = 0;
var pinIcon = {
  url: "assets/logos/Keep_Safe_transparent.png",
  size: new google.maps.Size(46, 46),
  origin: new google.maps.Point(0, 0),
  anchor: new google.maps.Point(17, 34),
  scaledSize: new google.maps.Size(46, 46)
}; 

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
		var result;
		for(var IResult = 0;IResult<results.length;IResult++){
			if($.inArray('route',results[IResult].types) == -1){
				result = results[IResult];
				break;
			}
		}
		if(result == undefined){
			content = "Couldn't find any information on the place.";
		}
		else{
			content = "<h4>"+result.name+"</h4><b>Phone:</b>"+result.formatted_phone_number;
		}
		var infowindow = new google.maps.InfoWindow({
			map: map,
			position: clickPosition,
			content: content
		});
	}
	else if(status == "OVER_QUERY_LIMIT"){
		console.log("Google won't let us have any more requests.");
	}
	else{
		console.log("Captain, we have an " + status + " whenever we query for place locations.");
	}
}

function AddLocationMarker(district,iPlace){
	//Get a good latlang
	locationObject = window.ksPlaces[district][iPlace];
	currentProgress += 1;
	$('#mapProgress').val(currentProgress);
	var request = {};
	geocoder.geocode( {'address': locationObject.postcode},function(results, status){
		if(status == "OK"){
			var marker = new google.maps.Marker({
				icon: pinIcon,
				position: results[0].geometry.location,
				map: map,
			});	
			google.maps.event.addListener(marker, 'click', function() {
				clickPosition = marker.getPosition();
				map.setZoom(17);
				map.setCenter(clickPosition);
				places.nearbySearch({location:clickPosition,radius:10},PlacesSearchCallback);
			});	
		}
		else{
			console.log("Failed to add a point due to " + status)
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
			setTimeout('AddLocationMarker("'+district+'",'+iPlace+');',iPlace*3000);
		}
		maxProgress += window.ksPlaces[district].length;
	}
	$('#mapProgress').attr('max',maxProgress);
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
