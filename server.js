const express = require('express')
const morgan = require('morgan')
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')

const justifyRoutes = require('./routes/justify.routes')
const app = express()

require('dotenv').config()
app.use(bodyParser.text());
app.use(morgan('dev'))
app.use(cookieParser())

const server = app.listen(process.env.PORT || 3000, () => {
  console.log('Back-end listening on PORT: ')
  console.log(
    (process.env.PORT !== undefined) ? process.env.PORT : '3000'
  )
})

app.use('/', (req, res) => {
  res.send('Hello from TicTacTrip API')
})
app.use('/api', justifyRoutes)

module.exports = server