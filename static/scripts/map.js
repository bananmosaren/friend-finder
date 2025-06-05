const style = {
  "version": 8,
	"sources": {
    "osm": {
			"type": "raster",
			"tiles": ["https://a.tile.openstreetmap.org/{z}/{x}/{y}.png"],
			"tileSize": 256,
      "attribution": "&copy; OpenStreetMap Contributors",
      "maxzoom": 19
    }
  },
  "layers": [
    {
      "id": "osm",
      "type": "raster",
      "source": "osm"
    }
  ]
};

const map = new maplibregl.Map({
  container: 'map',
  style: style,
  center: [18.0649, 59.33258],
  zoom: 5
});

map.addControl(
	new maplibregl.NavigationControl()
);

map.addControl(
    new maplibregl.GeolocateControl({
        positionOptions: {
            enableHighAccuracy: true
        },
        trackUserLocation: true
    })
);

navigator.geolocation.getCurrentPosition(
	function(position) {
		const lat = position.coords.latitude;
		const lng = position.coords.longitude;
		
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
	},
	function(error) {
		console.error("Error getting location: ", error);
	}
);

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
				// console.log(`user_id: ${item.user_id}, lat: ${item.latitude}, lng: ${item.longitude}`);
				const userId = (document.cookie
					.split('; ')
					.find(row => row.startsWith('user_id=')) || '')
					.split('=')[1];
				// console.log("user_id in locations: ", item.id, "user_id in cookies: ", userId)
				if (item.user_id !== userId) {
					var color = randomColor();
					// console.log(color)
					const marker = new maplibregl.Marker( {
						color: color,
					})
						.setLngLat([item.longitude, item.latitude])
						.addTo(map);
						// console.log("new marker")
				}
			})
		})
		.catch(error => console.error('Error fetching: ', error));
}

function randomColor() {
	var characters = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "A", "B", "C", "D", "E","F"];
	var color = "#";
	
	for (let i = 0; i < 6; i++) {
		var color = color + characters[(Math.random() * characters.length) | 0]
	}
	return color;
}

getLocations();
