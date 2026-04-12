const express = require("express");
const router = express.Router();
const db = require("../db");

// Home page
router.get("/", (req, res) => {
  res.sendFile("index.html", { root: "views" });
});

// Add job page
router.get("/add", (req, res) => {
  res.sendFile("add.html", { root: "views" });
});

// Insert job into DB
router.post("/add-job", (req, res) => {
  const { title, company, location } = req.body;

  db.query(
    "INSERT INTO jobs (title, company, location) VALUES (?, ?, ?)",
    [title, company, location],
    (err) => {
      if (err) throw err;
      res.redirect("/jobs");
    }
  );
});

// View jobs with styling
router.get("/jobs", (req, res) => {
  db.query("SELECT * FROM jobs", (err, results) => {
    if (err) throw err;

    let html = `
    <html>
    <head>
      <link rel="stylesheet" href="style.css">
    </head>
    <body>
    <header><h1>Job Listings</h1></header>
    <div class="container">
    `;

    results.forEach(job => {
      html += `
        <div class="job">
          <strong>${job.title}</strong><br>
          ${job.company} – ${job.location}
        </div>
      `;
    });

    html += `
      <br><a href="/">⬅ Back</a>
      </div></body></html>
    `;

    res.send(html);
  });
});

module.exports = router;
