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