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
		.then(data => console.log(data))
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
			console.log(data);
			
			locations.forEach(item => {
				console.log(`user_id: ${item.id}, lat: ${item.latitude}, lng: ${item.longitude}`);
				const marker = new maplibregl.Marker()
					.setLngLat([item.longitude, item.latitude])
					.addTo(map);
					console.log("new marker")
			})
		})
		.catch(error => console.error('Error fetching: ', error));
}

getLocations();
