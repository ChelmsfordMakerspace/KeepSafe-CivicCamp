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

function LatLngToMarker(location){
	var marker = new google.maps.Marker({
		icon: pinIcon,
		position: location,
		map: map,
	});	
	google.maps.event.addListener(marker, 'click', function() {
		clickPosition = marker.getPosition();
		map.setZoom(17);
		map.setCenter(clickPosition);
		places.nearbySearch({location:clickPosition,radius:10},PlacesSearchCallback);
	});	
}

function AddLocationMarker(district,iPlace){
	//Get a good latlang
	locationObject = window.ksPlaces[district][iPlace];
	currentProgress += 1;
	$('#mapProgress').val(currentProgress);
	var request = {};
	geocoder.geocode( {'address': locationObject.postcode},function(results, status){
		if(status == "OK"){
			var postcode = results[0].address_components[0].long_name;
			//Cache the response
			localStorage.setItem(postcode,results[0].geometry.location);
			LatLngToMarker(results[0].geometry.location);
		}
		else{
			console.log("Failed to add a point due to " + status)
		}
	});
}
function loadMap(){
	
    //Create a map
    map = new google.maps.Map($('.googlemap')[0],{zoom: 12,center:defaultLocation});
    places = new google.maps.places.PlacesService(map);
    FindCurrentPosition();
    LoadDatabase(databaseURL);
}

//Iterate through locations
function PopulateMap(){
	for(var district in window.ksPlaces){
		for(var iPlace = 0;iPlace<window.ksPlaces[district].length;iPlace++){
			//Do we need to do this?
			var needGeocode = true;
			//Load the browser storage.
			if(typeof(Storage) !== "undefined") {
				// Code for localStorage/sessionStorage.
				var locationObject = window.ksPlaces[district][iPlace];
				if(localStorage[locationObject.postcode]){
					var strlatlng = localStorage[locationObject.postcode];
					strlatlng = strlatlng.replace('(','');
					strlatlng = strlatlng.replace(')','');
					var arrlatlng = strlatlng.split(", ");
					var latlng =  new google.maps.LatLng(arrlatlng[0],arrlatlng[1]);
					LatLngToMarker(latlng);
					needGeocode = false;
					currentProgress += 1;
					$('#mapProgress').val(currentProgress);
					if(currentProgress / maxProgress > 0.8){
						$('#progressParagraph').hide();
					}
				}
			}
			if(needGeocode)
			{
				setTimeout('AddLocationMarker("'+district+'",'+iPlace+');',iPlace*3000);
			}
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
