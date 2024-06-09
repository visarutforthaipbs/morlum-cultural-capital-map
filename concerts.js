// Initialize the map centered on the northeast of Thailand
const map = L.map("map", {
  zoomControl: false,
}).setView([16.0, 104.0], 8);

// Add zoom control to the top right
L.control
  .zoom({
    position: "topright",
  })
  .addTo(map);

// Add Transport Map tiles
L.tileLayer(
  "https://tile.thunderforest.com/transport/{z}/{x}/{y}.png?apikey=4a98d80f4fbc47d7a4582e9f9dc26709",
  {
    attribution: "&copy; OpenStreetMap contributors & Thunderforest",
    apikey: "4a98d80f4fbc47d7a4582e9f9dc26709",
    updateWhenIdle: true,
    updateWhenZooming: false,
    keepBuffer: 2,
  }
).addTo(map);

// Create a marker cluster group
const markers = L.markerClusterGroup();

// Define custom marker icon using SVG
const customIcon = L.icon({
  iconUrl: "./asset/icon-circle-background.svg",
  iconSize: [38, 38],
  iconAnchor: [19, 38],
  popupAnchor: [0, -38],
});

// Function to extract YouTube video ID and create thumbnail URL
function getYouTubeThumbnail(videoUrl) {
  const videoId =
    videoUrl.split("v=")[1]?.split("&")[0] || videoUrl.split("youtu.be/")[1];
  return `https://img.youtube.com/vi/${videoId}/0.jpg`;
}

// Function to create a marker
function createMarker(concert) {
  const name = concert["ชื่อคณะ"];
  const contact = concert["เบอร์ติดต่อ"];
  const details = concert["รายละเอียด"];
  const lat = parseFloat(concert["lat"]);
  const long = parseFloat(concert["long"]);
  const videoUrl = concert["videoUrl"];
  const thumbnailUrl = getYouTubeThumbnail(videoUrl);

  const popupContent = `
  <b>${name}</b><br>เบอร์ติดต่อ: ${contact}<br>รายละเอียด: ${details}<br>
  <p>คลิกที่ภาพขนาดย่อเพื่อดูวิดีโอ:</p>
  <a href="${videoUrl}" target="_blank" class="thumbnail-wrapper">
    <img src="${thumbnailUrl}" alt="YouTube Thumbnail">
    <div class="play-button"></div>
  </a>
  <br>
  <a href="http://example.com/more-info/${name}" target="_blank">More Info</a>`;

  if (!isNaN(lat) && !isNaN(long)) {
    return L.marker([lat, long], { icon: customIcon }).bindPopup(popupContent);
  }
  return null;
}

// Function to load data based on map bounds
function loadData(bounds, query = "") {
  markers.clearLayers();

  d3.csv("clean-morlum-data-picurl.csv")
    .then((data) => {
      data.forEach((concert) => {
        const name = concert["ชื่อคณะ"];
        const lat = parseFloat(concert["lat"]);
        const long = parseFloat(concert["long"]);

        if (
          bounds.contains([lat, long]) &&
          name.toLowerCase().includes(query.toLowerCase())
        ) {
          const marker = createMarker(concert);
          if (marker) markers.addLayer(marker);
        }
      });

      map.addLayer(markers);
    })
    .catch((error) => console.error("Error fetching concert data:", error));
}

// Initial data load
loadData(map.getBounds());

// Reload data when map movement ends
map.on("moveend", () => {
  const bounds = map.getBounds();
  loadData(bounds, searchBox.value);
});

// Search box functionality
const searchBox = document.getElementById("search-box");

searchBox.addEventListener("input", () => {
  const query = searchBox.value;
  const bounds = map.getBounds();
  loadData(bounds, query);
});

// Toggle description box
const descriptionBox = document.getElementById("description-box");
const toggleButton = document.getElementById("toggle-description");

toggleButton.addEventListener("click", () => {
  descriptionBox.classList.toggle("hidden");
});
