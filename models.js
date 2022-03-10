//Import Mongoose
const mongoose = require("mongoose");

//Define schema for movies Collection
let movieSchema = mongoose.Schema({
  Title: { type: String, required: true },
  Description: { type: String, required: true },
  Genre: {
    Name: String,
    Description: String
  },
  Director: {
    Name: String,
    Bio: String
  },
  ImagePath: String,
  Featured: Boolean
});

//Define Schema for users Collection
let userSchema = mongoose.Schema({
  Name: { type: String, required: true },
  Password: { type: String, required: true },
  Email: { type: String, required: true },
  Birthday: Date,
  FavoriteMovies: [{ type: mongoose.Schema.Types.ObjectId, ref: "Movie" }]
});

//Create models to use the defined schemas
let Movie = mongoose.model("Movie", movieSchema);
let User = mongoose.model("User", userSchema);

//Export the models to provide them for index.js
module.exports.Movie = Movie;
module.exports.User = User;
