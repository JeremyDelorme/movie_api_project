const jwtSecret = 'your_jwt_secret'; //(Same key as in JWTStrategy)

const jwt = require('jsonwebtoken'),
  passport = require('passport');

require('./passport');

// Function to create JWT (expiring in 7 days, using HS256 algorithm to encode)
let generateJWTToken = user => {
  return jwt.sign(user, jwtSecret, {
    subject: user.Username,
    expiresIn: '7d',
    algorithm: 'HS256'
  });
};

//POST: Allow users to login with username and password
module.exports = (router) => {
  router.post('/login', (req, res) => {
    passport.authenticate('local', { session: false }, (error, user, info) => {
      if (error || !user) {
        return res.status(400).json({
          message: 'Something went wrong',
          user: user,
        });
      }
      req.login(user, { session: false }, error => {
        if (error) {
          res.status(500).send(err);
        }
        // If user exists, generate JWT
        let token = generateJWTToken(user.toJSON());
        // Return the generated token
        return res.json({ user, token });
      });
    })(req, res);
  });
};
