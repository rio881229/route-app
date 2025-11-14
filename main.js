
let map = L.map('map').setView([25.0330, 121.5654], 12);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

let points = [];
let markers = [];
let routeLine = null;

async function geocode(addr){
  let url = "https://nominatim.openstreetmap.org/search?format=json&q=" + encodeURIComponent(addr);
  let r = await fetch(url);
  let j = await r.json();
  return j.length ? [parseFloat(j[0].lat), parseFloat(j[0].lon)] : null;
}

async function addAddress(){
  let addr = document.getElementById("addr").value;
  if(!addr) return;
  let pos = await geocode(addr);
  if(!pos){ alert("找不到此地址"); return; }
  let marker = L.marker(pos).addTo(map).bindPopup(addr);
  markers.push(marker);
  points.push(pos);
  map.setView(pos,15);
}

function dist(a,b){
  const R=6371;
  const dLat=(b[0]-a[0])*Math.PI/180;
  const dLng=(b[1]-a[1])*Math.PI/180;
  const lat1=a[0]*Math.PI/180;
  const lat2=b[0]*Math.PI/180;
  const h=Math.sin(dLat/2)**2 + Math.cos(lat1)*Math.cos(lat2)*Math.sin(dLng/2)**2;
  return 2*R*Math.asin(Math.sqrt(h));
}

function NN(pts){
  if(!pts.length) return [];
  let u=pts.slice();
  let route=[u.shift()];
  while(u.length){
    let last=route[route.length-1];
    let best=0, bestD=Infinity;
    for(let i=0;i<u.length;i++){
      let d=dist(last,u[i]);
      if(d<bestD){ bestD=d; best=i; }
    }
    route.push(u.splice(best,1)[0]);
  }
  return route;
}

function calculateRoute(){
  if(routeLine) map.removeLayer(routeLine);
  let r=NN(points);
  if(r.length>1){
    routeLine=L.polyline(r,{weight:4}).addTo(map);
    map.fitBounds(routeLine.getBounds());
  }
}
