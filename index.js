//LOADED EXPRESS FRAMEWORK
const express = require("express");
const app = express();

//CREATE AN ARRAY OF OBJECTS HOLDING TOP MOVIES
let topMovies = [
  {
    name: "Movie 1",
    director: "Director 1"
  },
  {
    name: "Movie 2",
    director: "Director 2"
  },
  {
    name: "Movie 3",
    director: "Director 3"
  },
  {
    name: "Movie 4",
    director: "Director 4"
  },
  {
    name: "Movie 5",
    director: "Director 5"
  },
  {
    name: "Movie 6",
    director: "Director 6"
  },
  {
    name: "Movie 7",
    director: "Director 7"
  },
  {
    name: "Movie 8",
    director: "Director 8"
  },
  {
    name: "Movie 9",
    director: "Director 9"
  },
  {
    name: "Movie 10",
    director: "Director 10"
  }
];

//IMPORT MORGAN MIDDLEWARE LIBRARY
const morgan = require("morgan");

//LOG BASIC REQUEST DATA IN TERMINAL USING MORGAN MIDDLEWARE LIBRARY
app.use(morgan("common"));

//GET topMovies JSON FOR '/movies' REQUEST URL
app.get("/movies", (req, res) => {
  res.json(topMovies);
});

//GET WELCOME MESSAGE FOR '/' REQUEST URL
app.get("/", (req, res) => {
  res.send("Welcome to the myMovies App!");
});

//SERVE STATIC CONTENT FOR THE APP FROM THE 'public' DIRECTORY
app.use(express.static("public"));

//ERROR HANDLING
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something broke!");
});

//LISTEN TO PORT 8080
app.listen(8080, () => {
  console.log("Your App is still listening on port 8080.");
});
