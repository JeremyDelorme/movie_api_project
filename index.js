/**
 * @module app
 */

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const morgan = require("morgan");
const bodyParser = require("body-parser");
const uuid = require("uuid");
const { check, validationResult } = require("express-validator");
const cors = require("cors");

// Imports mongoose models defined in models.js
Models = require("./models.js");
Movies = Models.Movie;
Users = Models.User;


app.use(cors());

// Allows Mongoose to connect to the myFlixDB database and perform CRUD operations
mongoose.connect(process.env.CONNECTION_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(morgan("common"));

app.use(cors());

// Defines which domains/origins can access the API 
let allowedOrigins = [
  "http://localhost:8080",
  "http://testsite.com",
  "http://localhost:1234",
  "http://localhost:4200",
  "https://movie-api-jeremydelorme.herokuapp.com/",
  "https://jeremydelorme.github.io/myFlix-Angular-app/"
];

let auth = require("./auth")(app);

const passport = require("passport");
require("./passport");

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) === -1) {
        let message =
          "The CORS policy for this application doesn’t allow access from origin " +
          origin;
        return callback(new Error(message), false);
      }
      return callback(null, true);
    }
  })
);

/**
 * GET: Returns welcome message for '/' request URL
 * @method GET
 * @memberof module:app
 * @see '/'
 * @returns {object} - returns a welcome message
 */

app.get("/", (req, res) => {
  res.send("Welcome to my myFlix App!");
});

/**
 * GET: All movies
 * @method GET
 * @memberof module:app
 * @see '/movies'
 * @returns {object[]} - returns the movies array
  * @requires authentication JWT
 */
app.get(
  "/movies",
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

/**
 * GET movie by title
 * @method GET
 * @memberof module:app
 * @see '/movies/:title'
 * @param {string} Title - Title of the movie
 * @returns {object} - returns the movie
  * @requires authentication JWT
 */
app.get(
  "/movies/:Title",
  // passport.authenticate("jwt", { session: false }),
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

/**
 * GET data about a genre by title
 * @method GET
 * @memberof module:app
 * @see '/movies/genre/:Name'
 * @param {string} Name (of genre)
 * @returns {object} - returns the genre infos
  * @requires authentication JWT
 */

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

/**
 * GET data about a director by title
 * @method GET
 * @memberof module:app
 * @see '/movies/director/:Name'
 * @param {string} Name (of director)
 * @returns {object} - returns the director infos
  * @requires authentication JWT
 */

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


/**
 * GET data about a single user
 * @method GET
 * @memberof module:app
 * @see '/users/:Username'
 * @param {string} user
 * @returns {object} - returns the Username
  * @requires authentication JWT
 */

app.get(
  "/users/:Username",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Users.findOne({ Username: req.params.Username })
      .then(user => {
        if (user) {
          // If a user with the corresponding username was found, return user info
          res.status(200).json(user);
        } else {
          res
            .status(400)
            .send(
              "User with the username " + req.params.Username + " was not found"
            );
        }
      })
      .catch(err => {
        console.error(err);
        res.status(500).send("Error: " + err);
      });
  }
);

/**
 * POST: Allows new users to register; Username, Password & Email are required fields
 * @method POST
 * @memberof module:app
 * @see '/users'
 * @param {string} Username 
 * @returns {object} - returns the user object
  * @requires authentication JWT
 */

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

/**
 * PUT: Allow users to update their user info (find by username)
 * @method PUT
 * @memberof module:app
 * @see '/users/:Username'
 * @param {string} Username 
 * @returns {object} - returns the user object updated
  * @requires authentication JWT
 */

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

/**
 * PATCH: Allows users to add a movie to their list of favorites
 * @method PATCH
 * @memberof module:app
 * @see '/users/:Username/movies/:MovieID'
 * @param {string} MovieID
 * @returns {object} - returns the list of favorite
  * @requires authentication JWT
 */

app.patch(
  "/users/:Username/movies/:MovieID",
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

/**
 * DELETE: Allows users to remove a movie from their list of favorites
 * @method DELETE
 * @memberof module:app
 * @see '/users/:Username/movies/:MovieID'
 * @param {string} MovieID
 * @returns {object} - returns the list of favorite with movie deleted
  * @requires authentication JWT
 */

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

/**
 * DELETE: Allows existing users to deregister
 * @method DELETE
 * @memberof module:app
 * @see '/users/:Username'
 * @param {string} Username
 * @returns {object} - returns success message
  * @requires authentication JWT
 */

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

/**
 * GET: Returns a list of ALL users
 * @method GET
 * @memberof module:app
 * @see '/users'
 * @param {string} Username
 * @returns {object} - returns array of users object
  * @requires authentication JWT
 */

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

/**
 * Handles errors
 */
// ERROR-HANDLING MIDDLEWARE FUNCTION
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something went wrong!");
});

/**
 * Defines port, listening to port 8000
 */
//LISTEN TO PORT 8080 or other
const port = process.env.PORT || 8080;
app.listen(port, "0.0.0.0", () => {
  console.log("Listening on Port " + port);
});
