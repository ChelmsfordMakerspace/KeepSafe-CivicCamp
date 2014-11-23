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

function LatLngToMarker(location,postcode){
	var marker = new google.maps.Marker({
		icon: pinIcon,
		position: location,
		map: map,
	});	
	google.maps.event.addListener(marker, 'click', function() {
		clickPosition = marker.getPosition();
		map.setZoom(17);
		map.setCenter(clickPosition);
		var place;
		//Find Location by postcode
		for(var iPlace in window.ksPlaces){
			if(postcode == window.ksPlaces[iPlace].Postcode){
				place = window.ksPlaces[iPlace];
			}
		}
		
		
		if(typeof place == 'undefined'){
			content = "Couldn't find any information on the place.";
		}
		else{
			content = "<h4>"+place.Venue+"</h4><b>Phone:</b>"+place.Phone;
		}
		
		var infowindow = new google.maps.InfoWindow({
			map: map,
			position: clickPosition,
			content: content
		});
	});	
	
}

function AddLocationMarker(iPlace){
	//Get a good latlang
	locationObject = window.ksPlaces[iPlace];
	currentProgress += 1;
	$('#mapProgress').val(currentProgress);
	var request = {};
	geocoder.geocode( {'address': locationObject.Postcode},function(results, status){
		if(status == "OK"){
			var postcode = results[0].address_components[0].long_name;
			//Cache the response
			localStorage.setItem(postcode,results[0].geometry.location);
			LatLngToMarker(results[0].geometry.location,postcode);
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
	for(var iPlace in window.ksPlaces){
		//Do we need to do this?
		var needGeocode = true;
		//Load the browser storage.
		if(typeof(Storage) !== "undefined") {
			// Code for localStorage/sessionStorage.
			var locationObject = window.ksPlaces[iPlace];
			if(localStorage[locationObject.Postcode]){
				var strlatlng = localStorage[locationObject.Postcode];
				strlatlng = strlatlng.replace('(','');
				strlatlng = strlatlng.replace(')','');
				var arrlatlng = strlatlng.split(", ");
				var latlng =  new google.maps.LatLng(arrlatlng[0],arrlatlng[1]);
				LatLngToMarker(latlng,locationObject.Postcode);
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
			setTimeout('AddLocationMarker('+iPlace+');',iPlace*3000);
		}
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
                		content: 'Here be you.'
            		});
		});
	}
}
$('#searchError').hide();

$("#searchText").keyup(function (e) {
    if (e.keyCode == 13) {
		FindLocation();
    }
});

function GotoPlacesLocation(results,status){
	if(status == "OK"){
		var bestLocation = results[0];
        map.setCenter(bestLocation.geometry.location);
		$('#searchError').hide();
	}
	else{
		$('#searchError').fadeIn();
	}
}

function FindLocation(){
	var searchText = $('#searchText').val();
	if(searchText == ""){
		$('#searchError').fadeIn();
		return false;
	}
	else{
		$('#searchError').hide();
	}
	
	service = new google.maps.places.PlacesService(map);
	var request = {query:searchText};
	service.textSearch(request, GotoPlacesLocation);
}
loadMap();
