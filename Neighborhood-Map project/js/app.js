// the locations var which contains all the mentioned locations on the map
var locations = [
		{"name": "Great Pyramids of Egypt", "lat": "29.9773", "lng": "31.1325"},
		{"name": 'Egyptian Museum', "lat": "30.0475", "lng": "31.2337"},
		{"name": "Abu Simbel Temples", "lat": "22.3372", "lng": "31.6258"},
		{"name": "Karnak", "lat": "25.7188", "lng": "32.6573"},
		{"name": "Temple of Philae", "lat": "24.0258", "lng": "32.8842"},
		{"name": "Bibliotheca Alexandrina", "lat": "31.2089", "lng": "29.9092"},
		
];


// create the map using google maps api, and center it to the 1st location, the pyramids and create the markers,
//to respond with the info of the location whenever the user clicks on it.
var map;
var coord = [];
var infowindow = new google.maps.InfoWindow({});
function initMap() {

	var mapCanvas = document.getElementById('map');
	var mapOptions = {
		center: new google.maps.LatLng(29.9773,31.1325),
		zoom: 13,
		mapTypeId: google.maps.MapTypeId.ROADMAP
	}
	map = new google.maps.Map(mapCanvas, mapOptions);

	var coord;
	var content;
	for (var i = 0; i < locations.length; i++){
		coord = new google.maps.LatLng(locations[i].lat, locations[i].lng);
		locations[i].marker = new google.maps.Marker({
			position: coord,
			map: map,
			title: locations[i].name
		});
		locations[i].marker.addListener('click', (function(loc) {
			return function() {
				openInfo(loc);
			};
		})(locations[i]));
	}
}

initMap();

// create the content that will be shown on the info window when the user clicks the location's.
function createContent(loc) {
	var content = "<h3>" + loc.name + "</h3>" +
		"<div class='coord'>Latitude: " + loc.lat + "</div>" +
		"<div class='coord'>Longitude: " + loc.lng + "</div>" +
		"<div class='restaurants'>the nearest restaurant is </div>";
	return content;
}

// this function is being called when the user clicks on the destination name and 
// it makes an ajax call to get info from foursquare api for this destination.
function openInfo(loc) {
	loc.marker.setAnimation(google.maps.Animation.BOUNCE);
	setTimeout(function(){ loc.marker.setAnimation(null); }, 1000);
	var url = "https://api.foursquare.com/v2/venues/search?client_id=R1EH1PWJV5HQ2MPKNIKZ3AQPWOGFRUZNW2TSOSC2BN5TCA4V&client_secret=3UM4HUND3RMJJ1U2I3BOUD55HI0QRQWABKSI5WLAZTJ3RKQ5&v=20190603"+
		"&ll="+loc.lat+","+loc.lng+
		"&query=restaurant"+
		"&limit=1"+
		"&radius=1000";
	var html = "";
	$.getJSON(url, function (data) {
        for (var i=0; i < data.response.venues.length; i++) {
        	html += "<div><a href='https://www.foursquare.com/v/"+data.response.venues[i].id+"'>"+data.response.venues[i].name+"</a></div>"
        }
        if(html == "") html = "There are no restaurants near the park"
        infowindow.setContent(createContent(loc) + html);
		infowindow.open(map, loc.marker);
   }).error(function(e){
        console.log("Problem with foursquare: " + e);
        html = "<div>We're sorry, loading restaurants is failed</div>";
        infowindow.setContent(createContent(loc) + html);
		infowindow.open(map, loc.marker);
    });
}

// The ViewModel
var ViewModel = function() {
	var self = this;

	
	var storeLocation;
	self.filter = ko.observable("");
	self.locationVisible = ko.computed( function() {
		storeLocation = [];
		locations.forEach(function(loc) {
			if (loc.name.toLowerCase().indexOf(self.filter().toLowerCase()) > -1) {
				storeLocation.push(loc);
				loc.marker.setMap(map);
			}else{
				loc.marker.setMap(null);
			}
		});
		return storeLocation;
	});

	
	self.select = function(parent) {
		openInfo(parent);
	}
};

ko.applyBindings(new ViewModel());
