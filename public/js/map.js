

mapboxgl.accessToken = maptoken;
const map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/mapbox/streets-v12',
  center: listing.geometry.coordinates,
  zoom: 9,
});

const marker1 = new mapboxgl.Marker({color:"red"})
.setLngLat(listing.geometry.coordinates)
.setPopup(new mapboxgl.Popup({offset: 25})
.setLngLat(listing.geometry.coordinates)
.setHTML("<h1>Hello World!</h1>"))
.addTo(map);