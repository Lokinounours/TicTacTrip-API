const jwt = require('jsonwebtoken')
require('dotenv').config()

const requireToken = (req, res, next) => {

  const token = req.cookies.TicTacTripToken

  // check json web token exists & is verified
  if (token) {
    jwt.verify(token, process.env.SECRET, (err, decodedToken) => {
      if (err) {
        res.status(403).json({
          error: 'Corrupted token provided'
        })
      } else {
        next()
      }
    })
  }
  else {
    res.status(403).json({
      error: 'No token provided, go to /api/token to get a new token'
    })
  }
}

module.exports = { requireToken }