const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs");
const multer = require("multer");
const path = require("path");
const csvParser = require("csv-parser");
const createCsvWriter = require("csv-writer").createObjectCsvWriter;
const cors = require("cors"); // Import the cors package

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors()); // Enable CORS

// Multer setup for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname)); // Appends the extension of the original file
  },
});

const upload = multer({ storage: storage });

// Ensure the uploads directory exists
if (!fs.existsSync("uploads")) {
  fs.mkdirSync("uploads");
}

// CSV Writer
const csvWriter = createCsvWriter({
  path: "molum_band_database.csv",
  header: [
    { id: "ชื่อคณะ", title: "ชื่อคณะ" },
    { id: "เบอร์ติดต", title: "เบอร์ติดต" },
    { id: "รายละเอียด", title: "รายละเอียด" },
    { id: "lat", title: "lat" },
    { id: "long", title: "long" },
    { id: "picture", title: "picture" },
  ],
  append: true,
});

// Load existing CSV data
let concertsData = [];
fs.createReadStream("molum_band_database.csv")
  .pipe(csvParser())
  .on("data", (row) => {
    concertsData.push(row);
  })
  .on("end", () => {
    console.log("CSV file successfully processed");
  })
  .on("error", (err) => {
    console.error("Error reading CSV file", err);
  });

// Route to handle form submission
app.post("/add-concert", upload.single("picture"), (req, res) => {
  const { band, details, lat, long } = req.body;
  const picture = req.file ? `/uploads/${req.file.filename}` : "";

  console.log("Received Form Data:", { band, details, lat, long, picture });

  const newConcert = {
    ชื่อคณะ: band,
    เบอร์ติดต: details,
    รายละเอียด: details,
    lat,
    long,
    picture,
  };
  concertsData.push(newConcert);

  csvWriter
    .writeRecords([newConcert])
    .then(() => {
      res.status(200).json(newConcert);
    })
    .catch((err) => {
      console.error("Error writing to CSV:", err);
      res.status(500).send("Error adding concert");
    });
});

// Route to get all concert data
app.get("/concerts", (req, res) => {
  // Convert relative image paths to absolute URLs
  const concertsWithFullImagePath = concertsData.map((concert) => ({
    ...concert,
    picture: concert.picture
      ? `${req.protocol}://${req.get("host")}${concert.picture}`
      : "",
  }));
  res.json(concertsWithFullImagePath);
});

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, "public")));
app.use("/uploads", express.static(path.join(__dirname, "uploads"))); // Serve uploaded files

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
