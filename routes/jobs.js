const express = require("express");
const router = express.Router();
const db = require("../db");
const bcrypt = require("bcrypt");

// ================================
// Home page
// ================================
router.get("/", (req, res) => {
  res.sendFile("index.html", { root: "views" });
});

// ================================
// Add Job Page
// ================================
router.get("/add", (req, res) => {
  res.sendFile("add.html", { root: "views" });
});

// ================================
// Insert Job
// ================================
router.post("/add-job", (req, res) => {
  const { title, company, location, salary, description } = req.body;

  db.query(
    "INSERT INTO jobs (title, company, location, salary, description) VALUES (?, ?, ?, ?, ?)",
    [title, company, location, salary, description],
    (err) => {
      if (err) throw err;
      res.redirect("/jobs");
    }
  );
});

// ================================
// View All Jobs (UPDATED UI)
// ================================
router.get("/jobs", (req, res) => {
  db.query("SELECT * FROM jobs", (err, results) => {
    if (err) throw err;

    let html = `
    <!DOCTYPE html>
    <html>
    <head>
      <link rel="stylesheet" href="/style.css">
    </head>
    <body>

    <div class="navbar">
      <div>Job Portal</div>
      <div>
        <a href="/">Home</a>
        <a href="/add">Add Job</a>
        <a href="/logout">Logout</a>
      </div>
    </div>

    <div class="container">
      <h2>Available Jobs</h2>
    `;

    if (results.length === 0) {
      html += `<p>No jobs found</p>`;
    } else {
      results.forEach(job => {
        html += `
          <div class="job">
            <h3>
              <a href="/job/${job.id}">
                ${job.title}
              </a>
            </h3>

            <p><b>Company:</b> ${job.company}</p>
            <p><b>Location:</b> ${job.location}</p>
            <p><b>Salary:</b> ₹${job.salary}</p>

            <a href="/job/${job.id}">
              View Details →
            </a>
          </div>
        `;
      });
    }

    html += `
      <br>
      <a href="/">⬅ Back</a>
    </div>
    </body>
    </html>
    `;

    res.send(html);
  });
});

// ================================
// Job Details Page
// ================================
router.get("/job/:id", (req, res) => {
  const jobId = req.params.id;

  db.query("SELECT * FROM jobs WHERE id = ?", [jobId], (err, results) => {
    if (err) throw err;

    const job = results[0];

    let html = `
    <html>
    <head>
      <link rel="stylesheet" href="/style.css">
    </head>
    <body>

    <div class="navbar">
      <div>Job Portal</div>
      <div>
        <a href="/jobs">Jobs</a>
        <a href="/">Home</a>
      </div>
    </div>

    <div class="container">
      <h2>${job.title}</h2>
      <p><b>Company:</b> ${job.company}</p>
      <p><b>Location:</b> ${job.location}</p>
      <p><b>Salary:</b> ₹${job.salary}</p>
      <p><b>Description:</b> ${job.description}</p>

      <br>
      <a href="/apply/${job.id}">
        <button>Apply Now</button>
      </a>
    </div>

    </body>
    </html>
    `;

    res.send(html);
  });
});

// ================================
// Apply Job
// ================================
router.get("/apply/:id", (req, res) => {
  if (!req.session.user) return res.redirect("/login");

  db.query(
    "INSERT INTO applications (user_id, job_id) VALUES (?, ?)",
    [req.session.user.id, req.params.id],
    () => res.send("Applied Successfully")
  );
});

// ================================
// Login Page
// ================================
router.get("/login", (req, res) => {
  res.sendFile("login.html", { root: "views" });
});

// ================================
// Signup Page
// ================================
router.get("/signup", (req, res) => {
  res.sendFile("signup.html", { root: "views" });
});

// ================================
// Handle Signup
// ================================
router.post("/signup", async (req, res) => {
  const { username, password } = req.body;

  const hashed = await bcrypt.hash(password, 10);

  db.query(
    "INSERT INTO users (username, password) VALUES (?, ?)",
    [username, hashed],
    () => res.redirect("/login")
  );
});

// ================================
// Handle Login
// ================================
router.post("/login", (req, res) => {
  const { username, password } = req.body;

  db.query(
    "SELECT * FROM users WHERE username = ?",
    [username],
    async (err, results) => {
      if (err) throw err;

      if (results.length === 0) return res.send("User not found");

      const match = await bcrypt.compare(password, results[0].password);
      if (!match) return res.send("Wrong password");

      req.session.user = results[0];
      res.redirect("/jobs");
    }
  );
});

// ================================
// Logout
// ================================
router.get("/logout", (req, res) => {
  req.session.destroy(() => res.redirect("/"));
});

module.exports = router;
