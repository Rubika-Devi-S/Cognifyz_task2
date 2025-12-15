const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs");
const path = require("path");

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

//path to json data storage
const datafilePath = path.join(__dirname, "data", "data.json");

//home page route
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/public/index.html");
});
//form submission route
app.post("/submit", (req, res) => {
  const { name, email, password } = req.body;

  //server side validation
  if (!name || name.trim().length < 3) {
    return res.send("Name is required");
  }
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailPattern.test(email)) {
    return res.send("Valid email is required");
  }
  const passwordPattern = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/;
  if (!passwordPattern.test(password)) {
    return res.send("Password must be at least 6 characters long");
  }

  //read existing data
  let existingData = [];
  if (fs.existsSync(datafilePath)) {
    const filedata = fs.readFileSync(datafilePath, "utf8");
    existingData = JSON.parse(filedata);
  }
  //append new data
  existingData.push({
    name,
    email,
    password,
    createdAt: new Date().toISOString(),
  });

  //write back to the file
  fs.writeFileSync(datafilePath, JSON.stringify(existingData, null, 2));
  res.send(`
  <script>
    alert("✅ Data submitted successfully!");
    document.forms[0].reset();
    window.location.href = "/";
  </script>
`);
});

//view data stored
app.get("/submissions", (req, res) => {
  const filedata = fs.readFileSync(datafilePath, "utf8");
  res.json(JSON.parse(filedata));
});

//start the server
app.listen(3000, () => {
  console.log("Server is running on http://localhost:3000");
});
