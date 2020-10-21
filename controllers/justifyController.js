const jwt = require('jsonwebtoken')
require('dotenv').config()

let rateLimitServer = new Map()

module.exports = rateLimitServer

const secure = (process.env.HTTPS == "true") ? true : false

// Create and return a JWT token from an Email
const createToken = (email) => {
  return jwt.sign(email, process.env.SECRET)
}

// Test if an object is empty
const isEmpty = (obj) => {
  for (var prop in obj) {
    if (obj.hasOwnProperty(prop)) {
      return false;
    }
  }

  return JSON.stringify(obj) === JSON.stringify({});
}

// Check is a date is Today date
const isToday = (userDate) => {
  const day = new Date(userDate)
  const Today = new Date()
  return day.getDate() === Today.getDate() && day.getMonth() === Today.getMonth() && day.getFullYear() === Today.getFullYear()
}

// implementation of Google LeetCode Challenge, 
const justifyText = function (textToJustify, maxWidth, email) { // ~20ms on a COLD start, 1 to 3ms on a HOT start
  let justidiedText = [[]]
  let nbOfWord = 0
  const wordTreated = textToJustify.length

  let rowLength = 0
  let rowOfWord = []
  // First for loop to divide the array of words in row
  for (let word in textToJustify) {
    // Word length + all other Word length + ( number of old Word = number of spaces ) <= mawWith (default 80)
    if (textToJustify[word].length + rowLength + rowOfWord.length <= maxWidth) {
      rowLength += textToJustify[word].length
      rowOfWord.push(textToJustify[word])
      nbOfWord++
    } else {
      rowOfWord.push(rowLength)
      justidiedText.push(rowOfWord)
      rowOfWord = []
      rowOfWord.push(textToJustify[word])
      nbOfWord++
      rowLength = textToJustify[word].length
    }
    if (word == textToJustify.length - 1) {
      rowOfWord.push(rowLength)
      justidiedText.push(rowOfWord)
    }
  }

  // Remove the first empty row
  justidiedText.shift()
  // Second loop to add necessary spaces
  let LastArray = []
  for (let row in justidiedText) {
    // Some equation to calculate the number of required spaces per slot
    let nbMissingSpaces = maxWidth - justidiedText[row].pop() + 1
    let nbEmptySlot = justidiedText[row].length - 1
    let nbSpacesLeft = nbMissingSpaces % nbEmptySlot
    let nbSpacesPerSlot = (nbMissingSpaces - (nbSpacesLeft)) / nbEmptySlot

    let newString = ""
    let nbWord = 0

    do {
      newString += justidiedText[row][nbWord]
      let spacesToAdd = (nbWord < nbSpacesLeft - 1) ? nbSpacesPerSlot + 1 : nbSpacesPerSlot
      newString += " ".repeat(spacesToAdd)
    } while (nbWord++ < justidiedText[row].length - 1)

    newString = newString.trim() // to remove the last extra space
    LastArray.push(newString)
  }

  // We left justify the last line
  LastArray[LastArray.length - 1] = justidiedText[justidiedText.length - 1].join(' ')

  // Update the quantity of treated word
  user = rateLimitServer.get(email)
  rateLimitServer.set(email, { word: user.word + wordTreated, date: new Date(Date.now()) })

  return LastArray
}

module.exports.token_post = async (req, res) => {
  try {
    if (isEmpty(req.body)) {
      res.status(403).json({ error: 'Unvalied email' })
    }
    else {
      // Register the user on the server data
      rateLimitServer.set(req.body, {
        word: 0,
        date: new Date(Date.now())
      })
      
      
      const token = createToken(req.body)
      res.cookie('TicTacTripToken', token, {
        httpOnly: true,
        secure: secure
      })
      res.status(200).json({
        message: 'Welcome from token_post Controller, here are your token'
      })
    }
  } catch (err) {
    res.status(400).json({ error: err })
  }
}

module.exports.justify_post = async (req, res) => {
  try {
    if (isEmpty(req.body)) throw 'No text provided'
    let textToJustify = req.body
    // We can use the fastest but unsecure function of JWT because our middleware already manage access
    let email = await jwt.decode(req.cookies.TicTacTripToken)

    /** I case of a server crash, the user can access the api with a valid token but no information about him on the server are hold.
    In this case, we need to recreate an instance of him. */
    let user = rateLimitServer.get(email)
    if (user == undefined || !isToday(user.date)) { // also check if the user Date change to reset the number of credit
      rateLimitServer.set(email, { word: 0, date: new Date(Date.now()) })
      user = { word: 0, date: new Date(Date.now()) }
    }


    if (user.word > 80000) res.status(402).json({ error: "Payment required" })
    else {
      const justidiedText = justifyText(textToJustify.split(" "), 80, email)
      res.status(200).json({
        justifiedMessage: justidiedText,
        message: 'success'
      })
    }
  } catch (err) {
    res.status(400).json({ error: err })
  }
}