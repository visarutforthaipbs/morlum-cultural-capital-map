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
  }
).addTo(map);

// Define custom marker icon using SVG
const customIcon = L.icon({
  iconUrl: "asset/icon-circle-background.svg",
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

// Fetch and display data from CSV file
d3.csv("clean-morlum-data-picurl.csv")
  .then((data) => {
    data.forEach((concert) => {
      const name = concert["ชื่อคณะ"];
      const contact = concert["เบอร์ติดต่อ"];
      const details = concert["รายละเอียด"];
      const lat = parseFloat(concert["lat"]);
      const long = parseFloat(concert["long"]);
      const videoUrl = concert["videoUrl"];

      if (!isNaN(lat) && !isNaN(long)) {
        const thumbnailUrl = getYouTubeThumbnail(videoUrl);
        const popupContent = `
        <b>${name}</b><br>เบอร์ติดต่อ: ${contact}<br>รายละเอียด: ${details}<br>
        <p>คลิกที่ภาพขนาดย่อเพื่อดูวิดีโอ:</p>
        <a href="${videoUrl}" target="_blank" class="thumbnail-wrapper">
          <img src="${thumbnailUrl}" alt="YouTube Thumbnail">
          <div class="play-button"></div>
        </a>`;
        L.marker([lat, long], { icon: customIcon })
          .addTo(map)
          .bindPopup(popupContent);
      }
    });
  })
  .catch((error) => console.error("Error fetching concert data:", error));
