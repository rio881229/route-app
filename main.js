
let map = L.map('map').setView([25.0330, 121.5654], 12);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

let points = [];
let markers = [];
let routeLine = null;

function addRandomPoint() {
  let lat = 25.02 + Math.random() * 0.03;
  let lng = 121.55 + Math.random() * 0.03;
  let marker = L.marker([lat, lng]).addTo(map);
  markers.push(marker);
  points.push([lat, lng]);
}

function calculateDistance(a, b) {
  const R = 6371;
  const dLat = (b[0]-a[0]) * Math.PI/180;
  const dLng = (b[1]-a[1]) * Math.PI/180;
  const lat1 = a[0]*Math.PI/180;
  const lat2 = b[0]*Math.PI/180;

  const h = Math.sin(dLat/2)**2 + Math.cos(lat1)*Math.cos(lat2)*Math.sin(dLng/2)**2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

function nearestNeighborRoute(pts) {
  if (pts.length === 0) return [];
  let unvisited = pts.slice();
  let route = [unvisited.shift()];
  while (unvisited.length) {
    let last = route[route.length-1];
    let idx = 0;
    let best = Infinity;
    for (let i=0;i<unvisited.length;i++){
      let d = calculateDistance(last, unvisited[i]);
      if (d < best) { best = d; idx = i; }
    }
    route.push(unvisited.splice(idx,1)[0]);
  }
  return route;
}

function calculateRoute() {
  if (routeLine) map.removeLayer(routeLine);
  let route = nearestNeighborRoute(points);
  if (route.length > 1) {
    routeLine = L.polyline(route, {weight:4}).addTo(map);
    map.fitBounds(routeLine.getBounds());
  }
}
