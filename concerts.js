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

// Define custom marker icons for each type
const markerIcons = {
  "ค่ายเพลง": L.icon({
    iconUrl: "./asset/music-icon.svg", // Replace with the correct path to your icon
    iconSize: [38, 38],
    iconAnchor: [19, 38],
    popupAnchor: [0, -38],
  }),
  "เครื่องดนตรี": L.icon({
    iconUrl: "./asset/instrument-icon.svg", // Replace with the correct path to your icon
    iconSize: [38, 38],
    iconAnchor: [19, 38],
    popupAnchor: [0, -38],
  }),
  "เครื่องเสียง": L.icon({
    iconUrl: "./asset/sound-icon.svg", // Replace with the correct path to your icon
    iconSize: [38, 38],
    iconAnchor: [19, 38],
    popupAnchor: [0, -38],
  }),
  "จัดเวที": L.icon({
    iconUrl: "./asset/stage-icon.svg", // Replace with the correct path to your icon
    iconSize: [38, 38],
    iconAnchor: [19, 38],
    popupAnchor: [0, -38],
  }),
  "ชุด": L.icon({
    iconUrl: "./asset/costume-icon.svg", // Replace with the correct path to your icon
    iconSize: [38, 38],
    iconAnchor: [19, 38],
    popupAnchor: [0, -38],
  }),
  "นักเขียน": L.icon({
    iconUrl: "./asset/writer-icon.svg", // Replace with the correct path to your icon
    iconSize: [38, 38],
    iconAnchor: [19, 38],
    popupAnchor: [0, -38],
  }),
  "ปราชญ์ชาวบ้าน": L.icon({
    iconUrl: "./asset/village-expert-icon.svg", // Replace with the correct path to your icon
    iconSize: [38, 38],
    iconAnchor: [19, 38],
    popupAnchor: [0, -38],
  }),
  "รับผลิตสื่อ": L.icon({
    iconUrl: "./asset/media-production-icon.svg", // Replace with the correct path to your icon
    iconSize: [38, 38],
    iconAnchor: [19, 38],
    popupAnchor: [0, -38],
  }),
  "วงดนตรี": L.icon({
    iconUrl: "./asset/band-icon.svg", // Replace with the correct path to your icon
    iconSize: [38, 38],
    iconAnchor: [19, 38],
    popupAnchor: [0, -38],
  }),
  "ศิลปินแห่งชาติ": L.icon({
    iconUrl: "./asset/national-artist-icon.svg", // Replace with the correct path to your icon
    iconSize: [38, 38],
    iconAnchor: [19, 38],
    popupAnchor: [0, -38],
  }),
  "สถาบันความรู้หมอลำ": L.icon({
    iconUrl: "./asset/moralam-knowledge-icon.svg", // Replace with the correct path to your icon
    iconSize: [38, 38],
    iconAnchor: [19, 38],
    popupAnchor: [0, -38],
  }),
  "หมอลำ": L.icon({
    iconUrl: "asset/icon-circle-background.svg", // Replace with the correct path to your icon
    iconSize: [38, 38],
    iconAnchor: [19, 38],
    popupAnchor: [0, -38],
  }),
  "ทางเครื่อง": L.icon({
    iconUrl: "./asset/machine-path-icon.svg", // Replace with the correct path to your icon
    iconSize: [38, 38],
    iconAnchor: [19, 38],
    popupAnchor: [0, -38],
  }),
  "ออกแบบการแสดง": L.icon({
    iconUrl: "./asset/performance-design-icon.svg", // Replace with the correct path to your icon
    iconSize: [38, 38],
    iconAnchor: [19, 38],
    popupAnchor: [0, -38],
  }),
  "default": L.icon({
    iconUrl: "./asset/default-icon.svg", // A default icon for types not specifically defined
    iconSize: [38, 38],
    iconAnchor: [19, 38],
    popupAnchor: [0, -38],
  })
};



// Function to extract YouTube video ID and create thumbnail URL
function getYouTubeThumbnail(videoUrl) {
  const videoId =
    videoUrl.split("v=")[1]?.split("&")[0] || videoUrl.split("youtu.be/")[1];
  return `https://img.youtube.com/vi/${videoId}/0.jpg`;
}

// Function to create a marker
function createMarker(concert) {
  const type = concert["ประเภท"];
  const name = concert["ชื่อ"];
  const contact = concert["ช่องทางติดต่อ"];
  const details = concert["รายละเอียด"];
  const lat = parseFloat(concert["lat"]);
  const long = parseFloat(concert["long"]);
  const link = concert["link"];
  const thumbnailUrl = getYouTubeThumbnail(link);

  if (!isNaN(lat) && !isNaN(long)) {
    const icon = markerIcons[type] || markerIcons["default"]; // Use default icon if type is not defined
    const marker = L.marker([lat, long], { icon });

    marker.on("click", () => {
      showSidebar({
        type,
        name,
        contact,
        details,
        link,
        thumbnailUrl,
      });
    });

    return marker;
  } else {
    console.warn("Invalid Lat/Lng for concert:", concert);
    return null;
  }
}

// Function to load data based on filter criteria
function loadData(bounds, typeFilter = "") {
  markers.clearLayers();

  d3.csv("cleaned_ข้อมูลสำหรับแผนที่นิเวศหมอลำ_2024_no_removal.csv")
    .then((data) => {
      data.forEach((concert) => {
        const type = concert["ประเภท"];
        const lat = parseFloat(concert["lat"]);
        const long = parseFloat(concert["long"]);

        if (
          !isNaN(lat) &&
          !isNaN(long) &&
          bounds.contains([lat, long]) &&
          (typeFilter === "" || type === typeFilter)
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
    <p><strong>ประเภท:</strong> ${details.type}</p>
    <p><strong>ช่องทางติดต่อ:</strong> ${details.contact}</p>
    <p><strong>รายละเอียด:</strong> ${details.details}</p>
    <p><strong>ข้อมูลเพิ่มเติม:</strong> <a href="${details.link}" target="_blank">คลิกที่นี่</a></p>
    <p><strong>วิดีโอ:</strong></p>
    <a href="${details.link}" target="_blank" class="thumbnail-wrapper">
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
  loadData(bounds, typeFilter.value);
});

// Filter form functionality
const typeFilter = document.getElementById("type-filter");
const applyFilter = document.getElementById("apply-filter");

applyFilter.addEventListener("click", () => {
  const bounds = map.getBounds();
  loadData(bounds, typeFilter.value);
});

// Populate filter dropdown with unique types from the dataset
d3.csv("cleaned_ข้อมูลสำหรับแผนที่นิเวศหมอลำ_2024_no_removal.csv")
  .then((data) => {
    const uniqueTypes = [...new Set(data.map(concert => concert["ประเภท"]))];
    const typeFilterElement = document.getElementById("type-filter");
    uniqueTypes.forEach(type => {
      const option = document.createElement("option");
      option.value = type;
      option.textContent = type;
      typeFilterElement.appendChild(option);
    });
  })
  .catch((error) => console.error("Error fetching concert data for filter:", error));

// Toggle description box
const descriptionBox = document.getElementById("description-box");
const toggleButton = document.getElementById("toggle-description");

toggleButton.addEventListener("click", () => {
  descriptionBox.classList.toggle("hidden");
});
