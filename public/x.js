// Initialize the map centered on the northeast of Thailand
const map = L.map("map").setView([16.0, 104.0], 8); // Coordinates for the northeast of Thailand

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
  iconUrl: "../public/asset/can-1.svg", // Replace with the path to your SVG file
  iconSize: [38, 38], // size of the icon
  iconAnchor: [19, 38], // point of the icon which will correspond to marker's location
  popupAnchor: [0, -38], // point from which the popup should open relative to the iconAnchor
});

// Load and display existing data from the server
fetch("http://127.0.0.1:3000/concerts")
  .then((response) => {
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    return response.json();
  })
  .then((data) => {
    data.forEach((concert) => {
      // Extract fields from CSV structure
      const name = concert["ชื่อคณะ"];
      const contact = concert["เบอร์ติดต"];
      const details = concert["รายละเอียด"];
      const lat = parseFloat(concert["lat"]);
      const long = parseFloat(concert["long"]);
      const picture = concert["picture"];

      if (!isNaN(lat) && !isNaN(long)) {
        L.marker([lat, long], { icon: customIcon })
          .addTo(map)
          .bindPopup(
            `<b>${name}</b><br>Contact: ${contact}<br>${details}<br><img src="${picture}" alt="Band Picture" width="100">`
          );
      }
    });
  })
  .catch((error) => console.error("Error fetching concert data:", error));

// Handle user input
document
  .getElementById("concertForm")
  .addEventListener("submit", function (event) {
    event.preventDefault();

    const band = document.getElementById("band").value;
    const details = document.getElementById("details").value;
    const lat = parseFloat(document.getElementById("lat").value);
    const long = parseFloat(document.getElementById("long").value);
    const picture = document.getElementById("picture").files[0];

    const formData = new FormData();
    formData.append("band", band);
    formData.append("details", details);
    formData.append("lat", lat);
    formData.append("long", long);
    formData.append("picture", picture);

    fetch("http://127.0.0.1:3000/add-concert", {
      method: "POST",
      body: formData,
    })
      .then((response) => response.text())
      .then((message) => {
        alert(message);
        if (!isNaN(lat) && !isNaN(long)) {
          L.marker([lat, long], { icon: customIcon })
            .addTo(map)
            .bindPopup(`<b>${band}</b><br>${details}`);
        }
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  });

// Toggle form visibility
document
  .getElementById("toggleFormButton")
  .addEventListener("click", function () {
    const formContent = document.getElementById("formContent");
    if (
      formContent.style.display === "none" ||
      formContent.style.display === ""
    ) {
      formContent.style.display = "block";
      this.textContent = "Hide Form";
    } else {
      formContent.style.display = "none";
      this.textContent = "Add a Concert";
    }
  });
