// Load express framework
const express = require("express");
const app = express();
// Import middleware libraries: Morgan, body-parser, and uuid
const morgan = require("morgan"),
  bodyParser = require("body-parser"),
  uuid = require("uuid");

//Use body-parser middleware function
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// //Link auth file
// let auth = require("./auth")(app);
// const passport = require("passport");
// require("./passport");

// Import Mongoose, models.js and respective models
const mongoose = require("mongoose");
Models = require("./models.js");
Movies = Models.Movie;
Users = Models.User;

mongoose.connect("mongodb://localhost:27017/myFlixDB", {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

app.use(morgan("common"));

//1. READ: Return a list of all movies to the user
app.get("/movies", (req, res) => {
  Movies.find()
    .then(movies => {
      res.status(200).json(movies);
    })
    .catch(err => {
      res.status(500).send("Error: " + err);
    });
});

//2. READ: Return all data (description, genre, director, image URL, whether it's featured or not) about a single movie by title to the user
app.get("/movies/:title", (req, res) => {
  Movies.findOne({ Title: req.params.title }) // Find the movie by title
    .then(movie => {
      if (movie) {
        // If movie was found, return json, else throw error
        res.status(200).json(movie);
      } else {
        res.status(400).send("Movie not found");
      }
    })
    .catch(err => {
      res.status(500).send("Error: " + err);
    });
});

//3. READ: Return data about a genre (description) by Name
app.get("/movies/genre/:Name", (req, res) => {
  Movies.findOne({ "Genre.Name": req.params.Name }) // Find one movie with the genre by genre name
    .then(movie => {
      if (movie) {
        // If a movie with the genre was found, return json of genre info, else throw error
        res.status(200).json(movie.Genre);
      } else {
        res.status(400).send("Genre not found");
      }
    })
    .catch(err => {
      res.status(500).send("Error: " + err);
    });
});

//4. READ: Return data about a director (bio, birth, year, death year) by Name
app.get("/movies/directors/:Name", (req, res) => {
  Movies.findOne({ "Director.Name": req.params.Name }) // Find one movie with the director by name
    .then(movie => {
      if (movie) {
        // If a movie with the director was found, return json of director info, else throw error
        res.status(200).json(movie.Director);
      } else {
        res.status(400).send("Director not found");
      }
    })
    .catch(err => {
      res.status(500).send("Error: " + err);
    });
});

//5. CREATE: Allow new users to register (Username, Password and Email are required fields)
app.post("/users", (req, res) => {
  Users.findOne({ Username: req.body.Username })
    .then(user => {
      if (user) {
        // If the same username already exists, throw an error
        return res
          .status(400)
          .send(
            "User with the Username " + req.body.Username + " already exists!"
          );
      } else {
        // If the username is unique, create a new user with the given parameters from the request body
        Users.create({
          Username: req.body.Username,
          Password: req.body.Password,
          Email: req.body.Email,
          Birthday: req.body.Birthday
        })
          .then(user => {
            res.status(201).json(user);
          })
          .catch(err => {
            console.error(err);
            res.status(500).send("Error: " + err);
          });
      }
    })
    .catch(err => {
      console.error(err);
      res.status(500).send("Error: " + err);
    });
});

//6. UPDATE: Allow users to update their user infos (user is found by username)
app.put("/users/:Username", (req, res) => {
  Users.findOneAndUpdate(
    { Username: req.params.Username }, // Find user by existing username
    {
      $set: {
        // Info from request body that can be updated
        Username: req.body.Username,
        Password: req.body.Password,
        Email: req.body.Email,
        Birthday: req.body.Birthday
      }
    },
    { new: true }
  ) // Return the updated document
    .then(updatedUser => {
      res.json(updatedUser); // Return json object of updatedUser
    })
    .catch(err => {
      console.error(err);
      res.status(500).send("Error: " + err);
    });
});

//7. UPDATE: Allow users to add a movie to their list of favorite movies
app.patch("/users/:Username/movies/:MovieID", (req, res) => {
  Users.findOneAndUpdate(
    { Username: req.params.Username }, // Find user by username
    { $push: { FavoriteMovies: req.params.MovieID } }, // Add movie to the list
    { new: true }
  ) // Return the updated document
    .then(user => {
      if (user) {
        // If user was found, return success message, else return error
        res.status(200).send(req.params.MovieID + " was sucessfully added.");
      } else {
        res.status(400).send(req.params.MovieID + " was not found.");
      }
    })
    .catch(err => {
      console.error(err);
      res.status(500).send("Error: " + err);
    });
});

//8. DELETE: Allow users to remove a movie from their list of favorites
app.delete("/users/:Username/movies/:MovieID", (req, res) => {
  Users.findOneAndUpdate(
    { Username: req.params.Username }, // Find user by username
    { $pull: { FavoriteMovies: req.params.MovieID } }, // Remove movie from the list
    { new: true }
  ) // Return the updated document
    .then(user => {
      if (user) {
        // If user was found, return success message, else return error
        res.status(200).send(req.params.MovieID + " was sucessfully deleted.");
      } else {
        res.status(400).send(req.params.MovieID + " was not found.");
      }
    })
    .catch(err => {
      console.error(err);
      res.status(500).send("Error: " + err);
    });
});

//9. DELETE: Allow user to remove a user from list of users
app.delete("/users/:Username", (req, res) => {
  Users.findOneAndRemove({ Username: req.params.Username }) // Find user by username
    .then(user => {
      if (user) {
        // If user was found, return success message, else return error
        res
          .status(200)
          .send(
            "User with the Username " +
              req.params.Username +
              " was sucessfully deleted."
          );
      } else {
        res
          .status(400)
          .send(
            "User with the Username " + req.params.Username + " was not found."
          );
      }
    })
    .catch(err => {
      console.error(err);
      res.status(500).send("Error: " + err);
    });
});

// ERROR-HANDLING MIDDLEWARE FUNCTION
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something went wrong!");
});

//LISTEN TO PORT 8000
const port = 8080;
app.listen(port, () => {
  console.log("Your App is listening on port" + port);
});
