var map = L.map('map')
	.setView([51.505, -0.09], 13);
	
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);

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
	
	var marker = L.marker([lat, lng])
		.addTo(map);
}

navigator.geolocation.watchPosition(trackUser, (err) => {
	if (err.code === 1) {
		console.error("Please allow geolocation access");
	} else {
		console.error("Cannot get current location: " + err.message);
	}
}, {
	enableHighAccuracy: true,
	timeout: 5000,
	maximumAge: 2000
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
			locations = data;
			// console.log(data);
			
			locations.forEach(item => {
				// console.log(`user_id: ${item.user_id}, lat: ${item.lat}, lng: ${item.lng}`);
				const userId = (document.cookie
					.split('; ')
					.find(row => row.startsWith('user_id=')) || '')
					.split('=')[1];
				// console.log("user_id in locations: ", item.id, "user_id in cookies: ", userId)
				if (item.user_id !== userId) {
					const randomIcon = icons[Math.floor(Math.random() * icons.length)];
					console.log(randomIcon)
					var marker = L.marker([item.lat, item.lng], { icon: randomIcon })
						.addTo(map);
						// console.log("new marker")
				}
			})
		})
		.catch(error => console.error('Error fetching: ', error));
}

getLocations();
