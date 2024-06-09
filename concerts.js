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

  if (!isNaN(lat) && !isNaN(long)) {
    const marker = L.marker([lat, long], { icon: customIcon });

    marker.on("click", () => {
      showSidebar({
        name,
        contact,
        details,
        videoUrl,
        thumbnailUrl,
      });
    });

    return marker;
  }
  return null;
}

// Function to load data based on filter criteria
function loadData(bounds, nameFilter = "", locationFilter = "") {
  markers.clearLayers();

  d3.csv("clean-morlum-data-picurl.csv")
    .then((data) => {
      data.forEach((concert) => {
        const name = concert["ชื่อคณะ"];
        const location = concert["สถานที่"] || "";
        const lat = parseFloat(concert["lat"]);
        const long = parseFloat(concert["long"]);

        if (
          bounds.contains([lat, long]) &&
          name.toLowerCase().includes(nameFilter.toLowerCase()) &&
          location.toLowerCase().includes(locationFilter.toLowerCase())
        ) {
          const marker = createMarker(concert);
          if (marker) markers.addLayer(marker);
        }
      });

      map.addLayer(markers);
    })
    .catch((error) => console.error("Error fetching concert data:", error));
}

// Show sidebar with details
function showSidebar(details) {
  const sidebar = document.getElementById("sidebar");
  const sidebarContent = document.getElementById("sidebar-content");

  sidebarContent.innerHTML = `
    <h2>${details.name}</h2>
    <p><strong>เบอร์ติดต่อ:</strong> ${details.contact}</p>
    <p><strong>รายละเอียด:</strong> ${details.details}</p>
    <p><strong>วิดีโอ:</strong></p>
    <a href="${details.videoUrl}" target="_blank" class="thumbnail-wrapper">
      <img src="${details.thumbnailUrl}" alt="YouTube Thumbnail">
      <div class="play-button"></div>
    </a>
  `;

  sidebar.classList.add("show");
}

// Close sidebar
document.getElementById("close-sidebar").addEventListener("click", () => {
  document.getElementById("sidebar").classList.remove("show");
});

// Initial data load
loadData(map.getBounds());

// Reload data when map movement ends
map.on("moveend", () => {
  const bounds = map.getBounds();
  loadData(bounds, nameFilter.value, locationFilter.value);
});

// Filter form functionality
const nameFilter = document.getElementById("name-filter");
const locationFilter = document.getElementById("location-filter");
const applyFilter = document.getElementById("apply-filter");

applyFilter.addEventListener("click", () => {
  const bounds = map.getBounds();
  loadData(bounds, nameFilter.value, locationFilter.value);
});

// Toggle description box
const descriptionBox = document.getElementById("description-box");
const toggleButton = document.getElementById("toggle-description");

toggleButton.addEventListener("click", () => {
  descriptionBox.classList.toggle("hidden");
});
