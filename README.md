# Movie Api

## Objective

To build the server-side component of a “movies” web application. The web application will provide users with access to information about different movies, directors, and genres. Users will be able to sign up, update their personal information, and create a list of their favorite movies.

## Context

It’s no longer enough for a JavaScript developer to be skilled in frontend development alone. It’s become essential that you be able to interface with (as you did in Achievement 1) and even create your own APIs. For this reason, throughout this Achievement, you’ll create a REST API for an application called “myFlix” that interacts with a database that stores data about different movies.
In the next Achievement, you’ll build the client-side component of this same application using REACT. By the end of Achievement 3, you’ll have a complete web application (client-side and server-side) built using full-stack JavaScript technologies that you can showcase in your portfolio. The project will demonstrate your mastery of full-stack JavaScript development, including APIs, web server frameworks, databases, business logic, authentication, data security, and more. The complete tech stack you’ll master is known as the MERN (MongoDB, Express, React, and Node.js) stack.
Note that it’s not a requirement that you name your application “myFlix.” You’re also free to decide which movies you wish to include in your project. For example, you may want to build a movie application specifically for period or superhero movies, or a more diverse application with a wider user base. It’s up to you!
 
## User Story
 
 ● As a user, I want to be able to receive information on movies, directors, and genres so that I can learn more about movies I’ve watched or am interested in.
 ● As a user, I want to be able to create a profile so I can save data about my favorite movies.
 
## Essential Features

 ● Return a list of ALL movies to the user
 ● Return data (description, genre, director, image URL, whether it’s featured or not) about a
 single movie by title to the user
 ● Return data about a genre (description) by name/title (e.g., “Thriller”)
 ● Return data about a director (bio, birth year, death year) by name
 ● Allow new users to register
 ● Allow users to update their user info (username, password, email, date of birth)
 ● Allow users to add a movie to their list of favorites
 ● Allow users to remove a movie from their list of favorites
 ● Allow existing users to deregister
  
## Technical Requirements
 
 ● The API must be a Node.js and Express application.
 ● The API must use REST architecture, with URL endpoints corresponding to the data
 operations listed above
 ● The API must use at least three middleware modules, such as the body-parser package for
 reading data from requests and morgan for logging.
 ● The API must use a “package.json” file.
 ● The database must be built using MongoDB.
 ● The business logic must be modeled with Mongoose.
 ● The API must provide movie information in JSON format.
 ● The JavaScript code must be error-free.
 ● The API must be tested in Postman.
 ● The API must include user authentication and authorization code.
 ● The API must include data validation logic.
 ● The API must meet data security regulations.
 ● The API source code must be deployed to a publicly accessible platform like GitHub.
 ● The API must be deployed to Heroku.
