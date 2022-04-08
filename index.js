// Load express framework
const express = require("express");
const app = express();

// Import Mongoose, models.js and respective models
const mongoose = require("mongoose");
Models = require("./models.js");
Movies = Models.Movie;
Users = Models.User;

const cors = require("cors");
let allowedOrigins = [
  "http://localhost:8080",
  "http://testsite.com",
  "http://localhost:1234"
];

// Import middleware libraries: Morgan, body-parser, and uuid
const morgan = require("morgan"),
  bodyParser = require("body-parser"),
  uuid = require("uuid");

//Import express-validator
const { check, validationResult } = require("express-validator");

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) === -1) {
        // If a specific origin isn’t found on the list of allowed origins
        let message =
          "The CORS policy for this application doesn’t allow access from origin " +
          origin;
        return callback(new Error(message), false);
      }
      return callback(null, true);
    }
  })
);

mongoose.connect(process.env.CONNECTION_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

//Use body-parser middleware function
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

//Link auth file
let auth = require("./auth")(app);
const passport = require("passport");
require("./passport");

app.use(morgan("common"));

//READ: Get request
app.get("/", passport.authenticate("jwt", { session: false }), (req, res) => {
  res.send("Welcome to my myFlix App!");
});

//READ: Return a list of all movies to the user
app.get(
  "/movies",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Movies.find()
      .then(movie => {
        res.json(movie);
      })
      .catch(err => {
        console.error(err);
        res.status(500).send("Error: " + err);
      });
  }
);

//READ: Return all data (description, genre, director, image URL, whether it's featured or not) about a single movie by title to the user
app.get(
  "/movies/:Title",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
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
  }
);

//READ: Return data about a genre (description) by Name
app.get(
  "/movies/genre/:Name",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
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
  }
);

//READ: Return data about a director (bio, birth, year, death year) by Name
app.get(
  "/movies/directors/:Name",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
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
  }
);

//CREATE: Allow new users to register (Username, Password and Email are required fields)
app.post(
  "/users",
  [
    check("Username", "Username is required").isLength({ min: 5 }),
    check(
      "Username",
      "Username contains non alphanumeric characters - not allowed"
    ).isAlphanumeric(),
    check("Password", "Password is required")
      .not()
      .isEmpty(),
    check("Email", "Email does not appear to be valid").isEmail()
  ],
  (req, res) => {
    // Check the validation object for errors
    let errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    let hashedPassword = Users.hashPassword(req.body.Password);
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
            Password: hashedPassword,
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
  }
);

//UPDATE: Allow users to update their user infos (user is found by username)
app.put(
  "/users/:Username",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
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
  }
);

// //POST: Allow users to login
// app.post("");
//UPDATE: Allow users to add a movie to their list of favorite movies
app.patch(
  "/users/:Username/movies/:MovieID",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
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
  }
);

//DELETE: Allow users to remove a movie from their list of favorites
app.delete(
  "/users/:Username/movies/:MovieID",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Users.findOneAndUpdate(
      { Username: req.params.Username }, // Find user by username
      { $pull: { FavoriteMovies: req.params.MovieID } }, // Remove movie from the list
      { new: true }
    ) // Return the updated document
      .then(user => {
        if (user) {
          // If user was found, return success message, else return error
          res
            .status(200)
            .send(req.params.MovieID + " was sucessfully deleted.");
        } else {
          res.status(400).send(req.params.MovieID + " was not found.");
        }
      })
      .catch(err => {
        console.error(err);
        res.status(500).send("Error: " + err);
      });
  }
);

//DELETE: Allow user to remove a user from list of users
app.delete(
  "/users/:Username",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
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
              "User with the Username " +
                req.params.Username +
                " was not found."
            );
        }
      })
      .catch(err => {
        console.error(err);
        res.status(500).send("Error: " + err);
      });
  }
);

//READ: Return a list of all users
app.get(
  "/users",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Users.find()
      .then(users => {
        res.status(200).json(users);
      })
      .catch(err => {
        console.error(err);
        res.status(500).send("Error: " + err);
      });
  }
);

// ERROR-HANDLING MIDDLEWARE FUNCTION
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something went wrong!");
});

//LISTEN TO PORT 8080 or other
const port = process.env.PORT || 8080;
app.listen(port, "0.0.0.0", () => {
  console.log("Listening on Port " + port);
});
