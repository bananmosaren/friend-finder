var map = L.map('map')
	.setView([59.33258, 18.0649], 6);
	
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);

let userMarkers = [];
let friendMarkers = [];
let friendIcons = {};

function trackUser(pos) {
    const lat = pos.coords.latitude;
    const lng = pos.coords.longitude;
    const accuracy = pos.coords.accuracy;
	
	fetch('/submit/location', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({ lat: lat, lng: lng })
	})
	.then(response => response.json())
	// .then(data => console.log(data))
	.catch(error => console.error('Error fetching : ', error));
	
	clearUserMarkers();
	var marker = L.marker([lat, lng])
		.addTo(map);
		userMarkers.push(marker);
	marker.on('click', function(e){
		map.setView([e.latlng.lat, e.latlng.lng], 15);
	});
}

navigator.geolocation.watchPosition(trackUser, (err) => {
	if (err.code === 1) {
		console.error("Please allow geolocation access");
		alert("Please allow geolocation access");
	} else {
		console.error("Cannot get current location: " + err.message);
	}
}, {
	enableHighAccuracy: true,
	// timeout: 15000,
	maximumAge: 2000
});

window.addEventListener('beforeunload', function() {
	fetch('/cleanup', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		keepalive: true
	});
});

var LeafIcon = L.Icon.extend({
	options: {
		shadowUrl: 'static/media/leaf-shadow.png',
		iconSize:     [38, 95],
		shadowSize:   [50, 64],
		iconAnchor:   [22, 94],
		shadowAnchor: [4, 62],
		popupAnchor:  [-3, -76]
    }
});

var greenIcon = new LeafIcon({iconUrl: 'static/media/leaf-green.png'}),
	redIcon = new LeafIcon({iconUrl: 'static/media/leaf-red.png'}),
	orangeIcon = new LeafIcon({iconUrl: 'static/media/leaf-orange.png'});
	
var icons = [greenIcon, redIcon, orangeIcon];

function getLocations() {
	fetch('/current_locations')
		.then(response => {
		if (!response.ok) {
			throw new Error('Network response was not ok: ' + response.statusText);
		}
			return response.json();
		})
		.then(data => {
			// console.log(data);
			clearFriendMarkers();
			
			data.forEach(item => {
				console.log(`user_id: ${item.user_id}, lat: ${item.lat}, lng: ${item.lng}`);
				const userId = (document.cookie
					.split('; ')
					.find(row => row.startsWith('user_id=')) || '')
					.split('=')[1];
				// console.log("user_id in data: ", item.id, "user_id in cookies: ", userId)
				if (item.user_id !== userId) {
					if (!friendIcons[item.user_id]) {
						friendIcons[item.user_id] = icons[Math.floor(Math.random() * icons.length)];
					}
					const icon = friendIcons[item.user_id];
					
					// console.log(icon)
					// console.log(friendMarkers)
					var marker = L.marker([item.lat, item.lng], { icon: icon })
						.bindPopup(`<a href="/user/` + item.user_id + `" target="_blank">Potential friend!</a>`)
						.addTo(map)
						friendMarkers.push(marker);
				}
			})
		})
		.catch(error => console.error('Error fetching: ', error));
}

function clearUserMarkers() {
	userMarkers.forEach(marker => {
		map.removeLayer(marker);
	});
	userMarkers = [];
}

function clearFriendMarkers() {
	friendMarkers.forEach(marker => {
		map.removeLayer(marker);
	});
	friendMarkers = [];
}

setInterval(getLocations, 5000);
