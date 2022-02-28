const express = require("express"),
  morgan = require("morgan"),
  bodyParser = require("body-parser"),
  uuid = require("uuid");

const app = express();

app.use(bodyParser.json());

let users = [
  {
    id: 1,
    name: "mashedpotato",
    email: "mashedpotato@gmail.com",
    password: "ialsolovefries",
    birthday: "01/01/2001",
    favoriteMovies: ["Ice Age", "Finding Nemo", "Lion King"]
  },
  {
    id: 2,
    name: "friedchicken",
    email: "friedchicken@gmail.com",
    password: "ialsoloveveggiestuff",
    birthday: "12/12/2012",
    favoriteMovies: []
  }
];

let movies = [
  {
    Title: "Ice Age",
    Year: "2002",
    Genre: {
      Name: "Comedy",
      Description:
        "Comedy films are films that make the audience laugh without making them think about existential questions"
    },
    Director: {
      Name: "Chris Wedge",
      Birth: "1957",
      Death: "-"
    }
  },

  {
    Title: "Finding Nemo",
    Year: "2003",
    Genre: {
      Name: "Comedy",
      Description:
        "Comedy films are films that make the audience laugh without making them think about existential questions"
    },
    Director: {
      Name: "Andrew Stanton",
      Birth: "1965",
      Death: "-"
    }
  },
  {
    Title: "Lion King",
    Year: "1994",
    Genre: {
      Name: "Children Movie",
      Description:
        "Children movies are movies made for children under 13 years old."
    },
    Director: {
      Name: "Roger Allers",
      Birth: "1949",
      Death: "-"
    }
  }
];

//1. READ MOVIES
app.get("/movies", (req, res) => {
  res.status(200).json(movies);
});

//2. READ MOVIES BY TITLE
app.get("/movies/:title", (req, res) => {
  const { title } = req.params;
  const movie = movies.find(movie => movie.Title === title);

  if (movie) {
    res.status(200).json(movie);
  } else {
    res.status(400).send("no such movie");
  }
});

//3. READ GENRES BY NAME AND GET GENRE PROPERTY
app.get("/movies/genre/:genreName", (req, res) => {
  const { genreName } = req.params;
  const genre = movies.find(movie => movie.Genre.Name === genreName).Genre;

  if (genre) {
    res.status(200).json(genre);
  } else {
    res.status(400).send("no such genre");
  }
});

//4. READ DIRECTORS BY NAME
app.get("/movies/directors/:directorName", (req, res) => {
  const { directorName } = req.params;
  const director = movies.find(movie => movie.Director.Name === directorName)
    .Director;

  if (director) {
    res.status(200).json(director);
  } else {
    res.status(400).send("no such director");
  }
});

//5. CREATE USER
app.post("/users", (req, res) => {
  const newUser = req.body;

  if (newUser.name) {
    newUser.id = uuid.v4();
    users.push(newUser);
    res.status(201).json(newUser);
  } else {
    res.status(400).send("users need names");
  }
});

//6. UPDATE USERNAME
app.put("/users/:id", (req, res) => {
  const { id } = req.params;
  const updatedUser = req.body;

  let user = users.find(user => user.id == id);

  if (user) {
    user.name = updatedUser.name;
    res.status(200).json(user);
  } else {
    res.status(400).send("no such user");
  }
});

//7. UPDATE A MOVIE TO LIST OF FAVORITES
app.patch("/users/:id/:movieTitle", (req, res) => {
  const { id, movieTitle } = req.params;

  let user = users.find(user => user.id == id);

  if (user) {
    user.favoriteMovies.push(movieTitle);
    res.status(200).send(`${movieTitle} has been added to user ${id}'s array`);
  } else {
    res.status(400).send("no such user");
  }
});

//8. DELETE MOVIE FROM FAVORITE MOVIES LIST
app.delete("/users/:id/:movieTitle", (req, res) => {
  const { id, movieTitle } = req.params;

  let user = users.find(user => user.id == id);

  if (user) {
    user.favoriteMovies = user.favoriteMovies.filter(
      title => title !== movieTitle
    );
    res
      .status(200)
      .send(`${movieTitle} has been removed from user ${id}'s array`);
  } else {
    res.status(400).send("no such user");
  }
});

//9.
app.delete("/users/:id", (req, res) => {
  const { id } = req.params;

  let user = users.find(user => user.id == id);

  if (user) {
    users = users.filter(user => user.id != id);
    res.status(200).send(`user ${id} has been deleted`);
  } else {
    res.status(400).send("no such user");
  }
});

// ERROR-HANDLING MIDDLEWARE FUNCTION
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something went wrong!");
});

//LISTEN TO PORT 8080
app.listen(8080, () => {
  console.log("Your App is still listening on port 8080.");
});
